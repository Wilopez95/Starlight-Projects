import { type Options } from 'amqplib';

import {
  REQUIRE_TENANT_SYNC,
  AMQP_HOSTNAME,
  AMQP_TENANTS_EXCHANGE,
  AMQP_BUSINESS_UNITS_EXCHANGE,
  AMQP_HISTORY_EXCHANGE,
  AMQP_CUSTOMER_CONTACTS_QUEUE,
  AMQP_UMS_DEAD_LETTER,
  AMQP_LOGOUT_EXCHANGE,
} from '../../config';
import { getPublisherChannel, getSubscriberChannel } from './client';

type ExchangeType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string;
type ExchangesConfig = Record<string, [type: ExchangeType, options: Options.AssertExchange]>;

interface QueueConfig {
  options?: Options.AssertQueue;
  bindings?: [source: string, routingKey: string][];
}
type QueuesConfig = Record<string, QueueConfig>;

export const TENANTS_CREATE_QUEUE = 'tenants.create';
export const TENANTS_DELETE_QUEUE = 'tenants.delete';
export const BUSINESS_UNITS_UPDATES_QUEUE = 'business-units.updates';
export const LOGOUT_UPDATES_QUEUE = 'logout.updates';

const exchangesConfig: ExchangesConfig = {
  [AMQP_TENANTS_EXCHANGE]: ['direct', { durable: true }],
  [AMQP_BUSINESS_UNITS_EXCHANGE]: ['fanout', { durable: true }],
  [AMQP_HISTORY_EXCHANGE]: ['topic', { durable: true }],
  [AMQP_UMS_DEAD_LETTER]: ['direct', { durable: true }],
  [AMQP_LOGOUT_EXCHANGE]: ['fanout', { durable: true }],
};
const queuesConfig: QueuesConfig = {
  [AMQP_CUSTOMER_CONTACTS_QUEUE]: {
    bindings: [[AMQP_UMS_DEAD_LETTER, AMQP_CUSTOMER_CONTACTS_QUEUE]],
    options: {
      deadLetterExchange: AMQP_UMS_DEAD_LETTER,
      deadLetterRoutingKey: AMQP_CUSTOMER_CONTACTS_QUEUE,
    },
  },
  [TENANTS_CREATE_QUEUE]: {
    bindings: [
      [AMQP_TENANTS_EXCHANGE, 'create'],
      [AMQP_UMS_DEAD_LETTER, TENANTS_CREATE_QUEUE],
    ],
    options: {
      deadLetterExchange: AMQP_UMS_DEAD_LETTER,
      deadLetterRoutingKey: TENANTS_CREATE_QUEUE,
    },
  },
  [TENANTS_DELETE_QUEUE]: {
    bindings: [
      [AMQP_TENANTS_EXCHANGE, 'delete'],
      [AMQP_UMS_DEAD_LETTER, TENANTS_DELETE_QUEUE],
    ],
    options: {
      deadLetterExchange: AMQP_UMS_DEAD_LETTER,
      deadLetterRoutingKey: TENANTS_DELETE_QUEUE,
    },
  },
  [BUSINESS_UNITS_UPDATES_QUEUE]: {
    bindings: [
      [AMQP_BUSINESS_UNITS_EXCHANGE, ''],
      [AMQP_UMS_DEAD_LETTER, BUSINESS_UNITS_UPDATES_QUEUE],
    ],
    options: {
      deadLetterExchange: AMQP_UMS_DEAD_LETTER,
      deadLetterRoutingKey: BUSINESS_UNITS_UPDATES_QUEUE,
    },
  },
  [LOGOUT_UPDATES_QUEUE]: {
    bindings: [
      [AMQP_LOGOUT_EXCHANGE, ''],
      [AMQP_UMS_DEAD_LETTER, LOGOUT_UPDATES_QUEUE],
    ],
    options: {
      deadLetterExchange: AMQP_UMS_DEAD_LETTER,
      deadLetterRoutingKey: LOGOUT_UPDATES_QUEUE,
    },
  },
};

/**
 * It connects to the AMQP server, creates the exchanges and queues, and binds the queues to the
 * exchanges
 * @returns A promise that resolves when all the exchanges and queues have been created.
 */
export const amqpSetup = async (): Promise<void> => {
  if (!AMQP_HOSTNAME) {
    if (REQUIRE_TENANT_SYNC) {
      throw new Error('Tenant sync is required, but AMQP was not configured');
    }
    // If AMQP is not configured, it is a noop.
    return;
  }

  const publisher = await getPublisherChannel();
  const subscriber = await getSubscriberChannel();

  await Promise.all(
    Object.entries(exchangesConfig).map(([name, params]) =>
      publisher.assertExchange(name, ...params),
    ),
  );
  await Promise.all(
    Object.entries(queuesConfig).map(([name, { options, bindings }]) =>
      (async () => {
        await subscriber.assertQueue(name, options);
        if (bindings) {
          for (const [source, routingKey] of bindings) {
            await subscriber.bindQueue(name, source, routingKey);
          }
        }
      })(),
    ),
  );
};
