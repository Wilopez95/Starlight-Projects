import { WebSocketServer, WebSocket } from 'ws';
import { forOwn, has, isNil, pickBy, toNumber } from 'lodash';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { createLogger } from './logger';
import { client } from './redis';

import { WebSocket as PrintNodeWebSocketClient } from '../printnode-ws-http-client';
import {
  WEBSOCKET_PORT,
  WS_CONNECTION_PATH,
  WS_CONNECTION_REPEAT_COUNT,
  WS_CONNECTION_SEPARATOR,
  WS_CONNECTION_TIMEOUT_DELAY,
} from '../config';

const logger = createLogger({
  prettyPrint: {
    messageFormat: 'WEBSOCKET SERVER - {msg} ',
  },
});

interface ObservablePNSubject {
  key: string;
  scale: PrintNodeClient.ScaleResponse;
}

const observableSubject = new Subject<ObservablePNSubject>();

const observeScale = (
  key: string, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
): Observable<ObservablePNSubject> => {
  return observableSubject.pipe(
    filter((event) => event.key === key), // eslint-disable-line @typescript-eslint/no-explicit-any
  ) as Observable<ObservablePNSubject>;
};

let wss: WebSocketServer | undefined;

const connections: Record<string, PrintNodeClient.WebSocket> = {};
const scaleConnections: Record<string, number> = {};

const getScaleConnectionKey = (
  apiKey: string,
  computerId: string | number,
  deviceName: string,
  deviceNum: string | number,
) => [apiKey, computerId, deviceName, deviceNum].join(WS_CONNECTION_SEPARATOR);
const parseScaleConnectionKey = (key: string): PrintNodeClient.ScaleParams & { apiKey: string } => {
  const [apiKey, computerId, deviceName, deviceNum] = key.split(WS_CONNECTION_SEPARATOR);

  return {
    apiKey,
    computerId: toNumber(computerId),
    deviceName,
    deviceNum: toNumber(deviceNum),
  };
};

const getProcessLockKey = (apiKey: string) => `printnode-session-${apiKey}`;

const subscribeToScales = (ws: WebSocket, key: string) => {
  const { apiKey, ...options } = parseScaleConnectionKey(key);

  if (!connections[apiKey]) {
    return;
  }

  if (!has(scaleConnections, key)) {
    scaleConnections[key] = connections[apiKey].getScales(options, (message) => {
      observableSubject.next({ key, scale: message });
    });
  }

  const subscription = observeScale(key).subscribe((e) => {
    ws.send(JSON.stringify(e.scale));
  });

  ws.on('error', (e) => {
    logger.error(e, 'Error with client ws');

    if (subscription) {
      subscription.unsubscribe();
    }
  });

  ws.on('close', () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
};

const authenticatePNClient = async (ws: WebSocket, key: string, address = '', counter = 0) => {
  logger.info(`Authentication process for ${address} attempt=${counter}`);

  const { apiKey } = parseScaleConnectionKey(key);

  if (!connections[apiKey]) {
    const lock = await client.get(getProcessLockKey(apiKey));

    if (!lock) {
      await client.set(getProcessLockKey(apiKey), address, 'EX', 60);
    }

    connections[apiKey] = new PrintNodeWebSocketClient({ apiKey });
  }

  if (connections[apiKey].isConnected()) {
    subscribeToScales(ws, key);
  } else {
    connections[apiKey].subscribe('authenticate', async (authData) => {
      if ('error' in authData) {
        const connectionsToRemove = pickBy(scaleConnections, (_value, key) => key.includes(apiKey));
        forOwn(connectionsToRemove, (value, key) => {
          if (connections[apiKey]) {
            connections[apiKey].removeServerSubscription(value);
          }
          delete scaleConnections[key];
        });

        connections[apiKey].closeSocket();
        delete connections[apiKey];

        logger.error(
          authData,
          `Failed to authenticate client address=${address} apiKey=${apiKey} attempt=${counter}`,
        );

        if (counter === WS_CONNECTION_REPEAT_COUNT) {
          ws.close(1000, 'authentication.failed');
          await client.del(getProcessLockKey(apiKey));

          return;
        }

        setTimeout(
          () => authenticatePNClient(ws, key, address, ++counter),
          WS_CONNECTION_TIMEOUT_DELAY,
        );

        return;
      }
      await client.del(getProcessLockKey(apiKey));

      subscribeToScales(ws, key);
    });

    connections[apiKey].subscribe('error', (e: any) => {
      logger.error(e, 'Error on connection');
    });
  }
};

export function init(): void {
  wss = new WebSocketServer({ port: WEBSOCKET_PORT, path: WS_CONNECTION_PATH }, () => {
    logger.info(`initialized on port=${WEBSOCKET_PORT}`);
  });

  wss.on('connection', async function connection(ws, req) {
    const address = req.socket.remoteAddress;
    logger.info(`Start connection for ${address}`);

    if (!req.url) {
      logger.error(`Request url not found`);

      return;
    }

    const params = new URLSearchParams(req.url.replace(WS_CONNECTION_PATH, ''));
    const apiKey = params.get('apiKey');
    const options: PrintNodeClient.ScaleParams = {
      computerId: toNumber(params.get('computerId')),
      deviceName: params.get('deviceName') || undefined,
      deviceNum: toNumber(params.get('deviceNum')),
    };

    if (isNil(options.computerId) || !options.deviceName || isNil(options.deviceNum) || !apiKey) {
      logger.error('client is closed due to invalid args');
      ws.close();

      return;
    }

    const key = getScaleConnectionKey(
      apiKey,
      options.computerId,
      options.deviceName,
      options.deviceNum,
    );

    const processLock = await client.get(getProcessLockKey(apiKey));

    if (processLock) {
      logger.info('process is locked due to active authentication');
      ws.close(1000, 'lock');

      return;
    }

    await authenticatePNClient(ws, key, address);
  });
}

export function closeAll(): void {
  for (const key in scaleConnections) {
    const { apiKey } = parseScaleConnectionKey(key);

    if (connections[apiKey]) {
      connections[apiKey].removeServerSubscription(scaleConnections[key]);
    }
  }

  for (const apiKey in connections) {
    connections[apiKey].closeSocket();
  }

  if (wss) {
    wss.close();
  }
}
