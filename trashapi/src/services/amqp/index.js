import logger from '../logger/index.js';
import {
  AMQP_TENANTS_EXCHANGE,
  AMQP_DISPATCH_DEAD_LETTER,
  AMQP_CREATE_TENANTS_QUEUE,
  AMQP_DELETE_TENANTS_QUEUE,
  AMQP_COMPANIES_EXCHANGE,
  AMQP_UPDATE_COMPANY_QUEUE,
  SKIP_MQ_SETUP,
} from '../../config.js';
import Client from './client.js';
import MqReceiver from './receiver.js';
import { createTenantSub, removeTenantSub, updateCompanySub } from './subscriptions.js';

const queuesMap = {
  AMQP_DISPATCH_DEAD_LETTER,
  AMQP_CREATE_TENANTS_QUEUE,
  AMQP_DELETE_TENANTS_QUEUE,
  AMQP_UPDATE_COMPANY_QUEUE,
};
const exchangesMap = {
  AMQP_COMPANIES_EXCHANGE,
  AMQP_TENANTS_EXCHANGE,
  AMQP_DISPATCH_DEAD_LETTER,
};
const fullList = { ...queuesMap, ...exchangesMap };

const deadLetteredQueues = [
  AMQP_CREATE_TENANTS_QUEUE,
  AMQP_DELETE_TENANTS_QUEUE,
  AMQP_UPDATE_COMPANY_QUEUE,
];

const logError = error => logger.error(error);

export const setupMq = async () => {
  if (SKIP_MQ_SETUP) {
    return logger.info('MQ: setup is skipped');
  }

  logger.info('MQ: Setting up queues');

  const missedQueues = Object.entries(fullList).filter(
    // eslint-disable-next-line no-eq-null,eqeqeq
    ([, value]) => value == null,
  );
  if (missedQueues?.length) {
    const list = missedQueues.map(([, value]) => value).join(', ');
    logger.error(`Queues or exchanges: ${list} is missed in env vars`);
    // eslint-disable-next-line no-process-exit
    return process.exit(1);
  }

  const client = Client.getInstance();
  await client.connect();

  await Promise.all([
    client.assertQueue(
      AMQP_CREATE_TENANTS_QUEUE,
      {},
      {
        deadLetterExchange: AMQP_DISPATCH_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_CREATE_TENANTS_QUEUE,
      },
    ),
    client.assertQueue(
      AMQP_DELETE_TENANTS_QUEUE,
      {},
      {
        deadLetterExchange: AMQP_DISPATCH_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_DELETE_TENANTS_QUEUE,
      },
    ),
    client.assertQueue(
      AMQP_UPDATE_COMPANY_QUEUE,
      {},
      {
        deadLetterExchange: AMQP_DISPATCH_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_UPDATE_COMPANY_QUEUE,
      },
    ),
    client.channel.assertExchange(AMQP_TENANTS_EXCHANGE, 'direct'),
    client.channel.assertExchange(AMQP_DISPATCH_DEAD_LETTER, 'direct'),
    client.channel.assertExchange(AMQP_COMPANIES_EXCHANGE, 'direct'),
  ]);

  await Promise.all([
    client.channel.bindQueue(AMQP_CREATE_TENANTS_QUEUE, AMQP_TENANTS_EXCHANGE, 'create'),
    client.channel.bindQueue(AMQP_DELETE_TENANTS_QUEUE, AMQP_TENANTS_EXCHANGE, 'delete'),
    client.channel.bindQueue(AMQP_UPDATE_COMPANY_QUEUE, AMQP_COMPANIES_EXCHANGE, 'update'),
    ...deadLetteredQueues.map(queue =>
      client.channel.bindQueue(queue, AMQP_DISPATCH_DEAD_LETTER, queue),
    ),
  ]);

  // binding happens automatically since the default exchange

  await client.disconnect().catch(logError);

  logger.info('MQ: Running consuming method');

  // new consuming - new MQ receiver instance to re-use connection & channel right
  MqReceiver.getInstance().subscribe(
    AMQP_CREATE_TENANTS_QUEUE,
    createTenantSub,
    AMQP_DISPATCH_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_DELETE_TENANTS_QUEUE,
    removeTenantSub,
    AMQP_DISPATCH_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_UPDATE_COMPANY_QUEUE,
    updateCompanySub,
    AMQP_DISPATCH_DEAD_LETTER,
  );

  return logger.info('MQ: Setup is done');
};

export const resetMq = async () => {
  logger.info('MQ: Resetting queues');
  const queuesList = Object.values(queuesMap);
  const exchangesList = Object.values(exchangesMap);

  const client = Client.getInstance();
  await client.connect();

  await Promise.all(queuesList.map(queue => client.deleteQueue(queue)));

  await Promise.all(exchangesList.map(exchange => client.deleteExchange(exchange)));

  await client.disconnect().catch(logError);

  logger.info('MQ: Reset is done');
};
