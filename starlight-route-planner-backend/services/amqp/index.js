import { logger } from '../../utils/logger.js';

import {
  SKIP_MQ_SETUP,
  AMQP_TENANTS_EXCHANGE,
  AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH,
  AMQP_QUEUE_PUBLISH_MASTER_ROUTE,
  AMQP_QUEUE_DAILY_ROUTES_GENERATION,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH,
  AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER,
  AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH,
  AMQP_QUEUE_RECYCLING_ORDERS_TO_ROUTE_PLANNER,
} from '../../config.js';

import {
  createTenant,
  upsertJobSite,
  upsertWorkOrder,
  upsertServiceItems,
  softDeleteWorkOrder,
  updateCustomerInfo,
  updateRoutesWithDriver,
  updateRoutesWithTruck,
  syncWosMedia,
  attachWeightTicketFromRecyclingToDailyRoute,
} from './subscriptions.js';
import {
  masterRouteSubscriber,
  generateDailyRoutesFromMasterRoutesSubscriber,
} from './routesGeneration/subscriber.js';

import Client from './client.js';
import MqReceiver from './receiver.js';

const ROUTE_PLANNER_TENANTS_QUEUE = 'tenants.updates.routeplanner';

const QUEUES_MAP = {
  ROUTE_PLANNER_TENANTS_QUEUE,
  AMQP_TENANTS_EXCHANGE,
  AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH,
  AMQP_QUEUE_PUBLISH_MASTER_ROUTE,
  AMQP_QUEUE_DAILY_ROUTES_GENERATION,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH,
  AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER,
  AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH,
  AMQP_QUEUE_RECYCLING_ORDERS_TO_ROUTE_PLANNER,
};

const logError = err => logger.error(err);

export const setupMq = async () => {
  if (SKIP_MQ_SETUP) {
    return logger.info('MQ: setup is skipped');
  }

  logger.info('MQ: Setting up queues');

  const missedQueue = Object.entries(QUEUES_MAP).find(([, value]) => value == null);
  if (missedQueue) {
    logger.error(`Queue ${missedQueue[0]} is missed in env vars`);
    // eslint-disable-next-line no-process-exit
    return process.exit(1);
  }

  const client = Client.getInstance();
  await client.connect();

  // create queues for the default exchange
  await Promise.all([
    // client.assertQueue(AMQP_QUEUE_BUSINESS_UNITS),
    client.assertQueue(ROUTE_PLANNER_TENANTS_QUEUE),
    client.assertQueue(AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_PUBLISH_MASTER_ROUTE),
    client.assertQueue(AMQP_QUEUE_DAILY_ROUTES_GENERATION),
    client.assertQueue(AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER),
    client.assertQueue(AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_RECYCLING_ORDERS_TO_ROUTE_PLANNER),
    client.channel.assertExchange(AMQP_TENANTS_EXCHANGE, 'direct'),
  ]);

  await client.channel.bindQueue(ROUTE_PLANNER_TENANTS_QUEUE, AMQP_TENANTS_EXCHANGE, '');
  // binding happens automatically since the default exchange

  await client.disconnect().catch(logError);

  logger.info('MQ: Running consuming method');

  // new consuming - new MQ receiver instance to re-use connection & channel right
  MqReceiver.getInstance().subscribe(ROUTE_PLANNER_TENANTS_QUEUE, createTenant);
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH, upsertJobSite);
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH,
    upsertWorkOrder(false),
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH,
    upsertWorkOrder(true),
  );
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH, softDeleteWorkOrder);
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_PUBLISH_MASTER_ROUTE, masterRouteSubscriber);
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_DAILY_ROUTES_GENERATION,
    generateDailyRoutesFromMasterRoutesSubscriber,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH,
    upsertServiceItems,
  );
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER, updateCustomerInfo);
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH, updateRoutesWithTruck);
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH, updateRoutesWithDriver);
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH, syncWosMedia);
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_RECYCLING_ORDERS_TO_ROUTE_PLANNER,
    attachWeightTicketFromRecyclingToDailyRoute,
  );

  logger.info('MQ: Setup is done');
  return 'MQ: Setup is done';
};

export const resetMq = async () => {
  logger.info('MQ: Resetting queues');

  const queuesList = Object.values(QUEUES_MAP);
  const exchanges = [AMQP_TENANTS_EXCHANGE];

  const client = Client.getInstance();
  await client.connect();

  await Promise.all(queuesList.map(queue => client.deleteQueue(queue)));
  await Promise.all(exchanges.map(exchange => client.deleteExchange(exchange)));

  await client.disconnect().catch(logError);

  logger.info('MQ: Reset is done');
};

export default { sync: setupMq, reset: resetMq };
