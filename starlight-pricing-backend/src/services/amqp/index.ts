import * as Amqp from 'amqp-ts';

import {
  AMQP_TENANTS_EXCHANGE,
  AMQP_PRICING_DEAD_LETTER,
  AMQP_CREATE_TENANTS_QUEUE,
  AMQP_DELETE_TENANTS_QUEUE,
  AMQP_COMPANIES_EXCHANGE,
  AMQP_UPDATE_COMPANY_QUEUE,
  AMQP_SKIP_SETUP,
  AMQP_HOSTNAME,
  AMQP_USERNAME,
  AMQP_PORT,
  AMQP_PASSWORD,
  AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS,
} from '../../config/config';
import { ICreateTenantSubData } from '../../Interfaces/RabittMQ';
import { updateSubscriptionOrderStatus } from './subscriptionOrders';
import { createTenantSub } from './subscriptions';

const queuesMap = {
  AMQP_PRICING_DEAD_LETTER,
  AMQP_CREATE_TENANTS_QUEUE,
  AMQP_DELETE_TENANTS_QUEUE,
  AMQP_UPDATE_COMPANY_QUEUE,
  AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS,
};
const exchangesMap = {
  AMQP_COMPANIES_EXCHANGE,
  AMQP_TENANTS_EXCHANGE,
  AMQP_PRICING_DEAD_LETTER,
};
const fullList = { ...queuesMap, ...exchangesMap };

// const deadLetteredQueues = [
//   AMQP_CREATE_TENANTS_QUEUE,
//   AMQP_DELETE_TENANTS_QUEUE,
//   AMQP_UPDATE_COMPANY_QUEUE,
// ];

const AMQP_URL = `amqp://${AMQP_USERNAME}:${AMQP_PASSWORD}@${AMQP_HOSTNAME}:${AMQP_PORT}`;

export const setupMq = async () => {
  let connection: Amqp.Connection | undefined;
  const url = AMQP_URL;

  if (AMQP_SKIP_SETUP === 'true') {
    console.log('MQ: setup is skipped');
    return;
  }

  //Check all the var related to rabbit the env file
  const missedQueues = Object.entries(fullList).filter(
    ([, value]) => value == null || value == 'null' || value == '',
  );

  if (missedQueues.length) {
    const list = missedQueues.map(([value]) => value).join(', ');
    console.log(`Queues or exchanges: ${list} is missed in env vars`);
    return process.exit(1);
  }
  //Check all the var related to rabbit the env file

  try {
    connection = new Amqp.Connection(url);
  } catch (error: unknown) {
    console.log(`Failed to connect via amqp for URL, host: ${AMQP_HOSTNAME}`);
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (connection) {
    console.log(`MQ succesfull connected , host: ${AMQP_HOSTNAME}`);
    const exchange = connection.declareExchange(AMQP_TENANTS_EXCHANGE as string, 'direct');
    const args = {
      deadLetterExchange: AMQP_PRICING_DEAD_LETTER,
      deadLetterRoutingKey: AMQP_CREATE_TENANTS_QUEUE,
    };
    const queue: Amqp.Queue = connection.declareQueue(AMQP_CREATE_TENANTS_QUEUE as string, args);
    queue.bind(exchange, 'create');
    queue.activateConsumer((message: Amqp.Message) => {
      try {
        createTenantSub(message.getContent() as ICreateTenantSubData);
        queue._channel.deleteQueue(AMQP_CREATE_TENANTS_QUEUE as string);
      } catch (error: unknown) {
        console.log(error);
      }
    });

    const queue2: Amqp.Queue = connection.declareQueue(
      AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS,
      args,
    );
    queue2.bind(exchange, 'created');
    queue2.activateConsumer(message => {
      try {
        updateSubscriptionOrderStatus(message);
        queue2._channel.deleteQueue(AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS);
      } catch (error: unknown) {
        console.log(error);
      }
    });
  }
};
