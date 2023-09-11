import amqp from 'amqplib';

import { logger } from '../logger';

import {
  AMQP_HOSTNAME,
  AMQP_USERNAME,
  AMQP_PASSWORD,
  AMQP_PORT,
  AMQP_LOGOUT_EXCHANGE,
} from '../../config';
import { safeStringify } from '../../utils/safeStringify';
import { Context } from '../../context';

let AMQP_URL: string | undefined;

if (AMQP_HOSTNAME && AMQP_USERNAME && AMQP_PASSWORD && AMQP_PORT) {
  AMQP_URL = `amqp://${AMQP_USERNAME}:${AMQP_PASSWORD}@${AMQP_HOSTNAME}:${AMQP_PORT}`;
}

type ChannelKey = 'publish' | 'subscribe';

const connections: Record<ChannelKey, amqp.Connection | null> = { publish: null, subscribe: null };

const channels: Record<ChannelKey, amqp.Channel | null> = { publish: null, subscribe: null };

/**
 * It returns a function that returns a channel
 * @param {ChannelKey} key - ChannelKey - This is the key that we will use to store the channel in the
 * channels object.
 * @returns A function that returns a channel.
 */
const getChannel = (key: ChannelKey) => async () => {
  if (!AMQP_URL) {
    throw new Error('No AMQP configuration found');
  }

  let channel = channels[key];

  if (channel) {
    return channel;
  }

  const handleChannelClose = () => {
    channels[key]?.removeAllListeners();
    channels[key] = null;
  };

  const handleConnectionClose = (error: unknown) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    logger.error(error as object, 'HandleConnectionClose method');
    connections[key]?.removeAllListeners();
    connections[key] = null;
    handleChannelClose();
  };

  let connection = connections[key];
  if (!connection) {
    connection = await amqp.connect(AMQP_URL);
    connection.once('error', handleConnectionClose);
    connection.once('close', handleConnectionClose);

    connections[key] = connection;
  }

  channel = await connection.createChannel();
  channels[key] = channel;

  return channel;
};

export const getPublisherChannel = getChannel('publish');
export const getSubscriberChannel = getChannel('subscribe');

export const close = async (): Promise<void> => {
  for (const [key, channel] of Object.entries(channels)) {
    if (!channel) {
      // eslint-disable-next-line no-continue
      continue;
    }

    try {
      await channel.close();
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error, 'Failed to close channel or channel is closed');
      }
    }

    channels[key as ChannelKey] = null;
  }

  for (const [key, connection] of Object.entries(connections)) {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error, 'Failed to close connection or connection is closed');
        }
      }

      connections[key as ChannelKey] = null;
    }
  }
};

interface PublishOptions {
  type?: string;
  messageId?: string;
  persistent?: boolean;
  mandatory?: boolean;
}
/**
 * It publishes a message to an exchange with a given routing key, and returns a promise that resolves
 * when the message has been published
 * @param {string} exchange - The exchange to publish to.
 * @param {string} routingKey - The routing key is a message routing attribute in AMQP. It is used by
 * exchanges to route messages to queues.
 * @param {unknown} payload - The payload to publish.
 * @param {PublishOptions}  - exchange - The exchange to publish to.
 * @returns A function that takes in a string, a string, an unknown, and an object.
 */
export const publish = async (
  exchange: string,
  routingKey: string,
  payload: unknown,
  { messageId, persistent = true, mandatory, type }: PublishOptions = {},
): Promise<void> => {
  let channel = channels.publish;

  if (!channel) {
    // If AMQP is not configured, publish is a noop.
    if (!AMQP_URL) {
      return;
    }

    channel = await getPublisherChannel();
  }

  let args: Parameters<typeof channel.publish>;
  try {
    args = [
      exchange,
      routingKey,
      Buffer.from(safeStringify(payload), 'utf-8'),
      { contentType: 'application/json', messageId, persistent, mandatory, type },
    ];
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error, `Failed to serialize payload for exchange ${exchange}`);
    }
    return;
  }

  const isFull = channel.publish(...args);

  if (!isFull) {
    channel.once('drain', () => {
      channel?.publish(...args);
    });
  }
};

/**
 * It subscribes to a queue and calls a processor function for each message
 * @param {string} queue - The name of the queue to subscribe to.
 * @param processor - (msg: T, type?: string) => unknown
 * @param {string} [deadLetterExchange] - The name of the exchange to which the message will be sent if
 * the message processing fails.
 * @returns A promise that resolves when the message is published.
 */
export const subscribe = async <T>(
  queue: string,
  processor: (msg: T, type?: string) => unknown,
  deadLetterExchange?: string,
): Promise<void> => {
  let channel = channels.subscribe;

  if (!channel) {
    // If AMQP is not configured, publish is a noop.
    if (!AMQP_URL) {
      return;
    }

    channel = await getSubscriberChannel();
  }

  await channel.consume(
    queue,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async msg => {
      if (!msg) {
        return;
      }

      const msgBody = msg.content.toString('utf-8');

      if (msgBody) {
        let content: unknown;
        try {
          if (msg.properties.contentType === 'application/json') {
            content = JSON.parse(msgBody);
          } else {
            content = msg.content.toString('utf-8');
          }
        } catch (error) {
          if (error instanceof Error) {
            logger.error(error, `Received message: ${msgBody}. Parsing is failed`);
          }
        }

        if (content) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await processor(content as T, msg.properties.type);
          } catch (error) {
            if (error instanceof Error) {
              logger.error(
                error,
                `Failed to process message: ${msgBody}.Queue: ${queue},
                exchange: ${msg.fields.exchange}, redelivered: ${String(msg.fields.redelivered)}.`,
              );
            }

            if (deadLetterExchange) {
              if (deadLetterExchange === msg.fields.exchange) {
                logger.error(
                  `Failed to process dead letter message ${msgBody} on ${queue}. Rejecting...`,
                );

                return channel?.ack(msg);
              }
              if (!msg.fields.redelivered) {
                logger.error(`Requeuing ${msgBody} on ${queue}`);

                return channel?.nack(msg, false, true);
              }
              logger.error(`Putting ${msgBody} on ${queue} to dead letter (if setuped)`);

              return channel?.nack(msg, false, false);
            }
          }
        }
      } else {
        logger.error(
          `Certain message has no content, message: ${JSON.stringify(msg)}, queue: ${queue}`,
        );
      }

      channel?.ack(msg);
    },
    { noAck: false },
  );
};

/**
 * It publishes a message to the AMQP exchange with the userId of the user who just logged out
 * @param {Context} ctx - Context - the context object that is passed to the function
 * @returns A function that takes a context and returns a promise that resolves to void.
 */
export const publishUserLogoutEvent = async (ctx: Context): Promise<void> => {
  const userId = ctx.userInfo?.id;
  if (!userId) {
    return;
  }

  try {
    await publish(AMQP_LOGOUT_EXCHANGE, '', { userId });
  } catch (e) {
    if (e instanceof Error) {
      ctx.logger.error(e, 'Error during ampq publish message');
    }
  }
};
