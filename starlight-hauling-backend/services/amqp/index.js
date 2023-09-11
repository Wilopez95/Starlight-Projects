import { subscribers as routePlannerSubscribers } from '../routePlanner/subscribers.js';
import { subscribers as ordersGenerationSubscribers } from '../ordersGeneration/subscribers.js';
import { logger } from '../../utils/logger.js';
import {
  SKIP_MQ_SETUP,
  AMQP_QUEUE_CUSTOMER_BALANCES,
  AMQP_QUEUE_ORDER_TOTALS_TO_BILLING,
  AMQP_QUEUE_NOTIFY_CUSTOMERS,
  AMQP_QUEUE_DISPATCH_ORDERS,
  AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
  AMQP_QUEUE_BUSINESS_UNITS,
  AMQP_QUEUE_JOB_SITES_TO_BILLING,
  AMQP_QUEUE_CUSTOMERS_TO_BILLING,
  AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER,
  AMQP_QUEUE_GENERATE_SUBSCRIPTION_ORDERS,
  AMQP_QUEUE_GENERATE_SUBSCRIPTION_WOS,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH,
  ENABLE_SUBSCRIPTION_ORDERS_SYNC_STUB,
  AMQP_QUEUE_FREQUENCY_PRORATION,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_CORE,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
  AMQP_QUEUE_SYNC_ORDERS_LOB,
  AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
  AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
  AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
  AMQP_CUSTOMER_CONTACTS_QUEUE,
  AMQP_QUEUE_END_SUBSCRIPTIONS,
  AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES,
  AMQP_QUEUE_WORK_ORDERS_TO_RECYCLING,
  AMQP_QUEUE_WORK_ORDERS_FROM_RECYCLING,
  DISABLE_INDEPENDENT_ORDERS_SYNC_WITH_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH,
  AMQP_QUEUE_BUSINESS_LINES,
  AMQP_QUEUE_UPDATE_PRICE_GROUPS,
  AMQP_QUEUE_RESUME_SUBSCRIPTIONS_EMAIL_NOTIFICATION,
  AMQP_QUEUE_HOLD_CUSTOMER_EMAIL_NOTIFICATION,
  AMQP_QUEUE_GENERATE_REMINDERS,
  AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS,
  AMQP_QUEUE_SUBSCRIPTIONS_PROLONGATION,
  AMQP_TENANTS_EXCHANGE,
  AMQP_BUSINESS_UNITS_EXCHANGE,
  AMQP_HAULING_DEAD_LETTER,
  AMQP_COMPANIES_DATA_EXCHANGE,
  AMQP_QUEUE_SALES_REP_HISTORY,
  AMQP_HISTORY_EXCHANGE,
  AMQP_HISTORY_USERS_TOPIC,
  AMQP_QUEUE_SUBSCRIPTIONS_EXPIRED_BILLING_PERIOD,
  AMQP_QUEUE_GENERATE_DAILY_SUBSCRIPTION_ORDERS,
} from '../../config.js';
import Client from './client.js';
import MqReceiver from './receiver.js';

import {
  updateCustomerBalance,
  notifyCustomers,
  dispatchOrder,
  updateServiceItemPrice,
  prolongateSubscriptions,
  generateTenantOrdersFromRecurrentOrderTemplates,
  handleFailedOrSuccessfulRecurrentOrderPayment,
  rollbackFailedToInvoiceOrders,
  updateOrdersPaymentMethods,
  closeEndingSubscriptions,
  updateSubscriptionsByRatesChanges,
  upsertLandfillOperation,
  updateSalesRep,
  updatePriceGroups,
  notifyResumeSubscriptions,
  subscriptionsExpiredBillingPeriod,
  notifyHoldCustomer,
} from './subscriptions.js';
import { generateReminders } from './reminders.js';

const queuesMap = {
  AMQP_QUEUE_CUSTOMER_BALANCES,
  AMQP_QUEUE_ORDER_TOTALS_TO_BILLING,
  AMQP_QUEUE_NOTIFY_CUSTOMERS,
  AMQP_QUEUE_DISPATCH_ORDERS,
  AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
  AMQP_QUEUE_BUSINESS_UNITS,
  AMQP_QUEUE_JOB_SITES_TO_BILLING,
  AMQP_QUEUE_CUSTOMERS_TO_BILLING,
  AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER,
  AMQP_QUEUE_GENERATE_SUBSCRIPTION_ORDERS,
  AMQP_QUEUE_GENERATE_SUBSCRIPTION_WOS,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH,
  AMQP_QUEUE_FREQUENCY_PRORATION,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_CORE,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
  AMQP_QUEUE_SYNC_ORDERS_LOB,
  AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,

  AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
  AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
  AMQP_CUSTOMER_CONTACTS_QUEUE,
  AMQP_QUEUE_END_SUBSCRIPTIONS,
  AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES,
  AMQP_QUEUE_WORK_ORDERS_TO_RECYCLING,
  AMQP_QUEUE_WORK_ORDERS_FROM_RECYCLING,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH,
  AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH,
  AMQP_QUEUE_BUSINESS_LINES,
  AMQP_QUEUE_UPDATE_PRICE_GROUPS,
  AMQP_QUEUE_RESUME_SUBSCRIPTIONS_EMAIL_NOTIFICATION,
  AMQP_QUEUE_GENERATE_REMINDERS,
  AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS,
  AMQP_QUEUE_SUBSCRIPTIONS_PROLONGATION,
  AMQP_QUEUE_HOLD_CUSTOMER_EMAIL_NOTIFICATION,

  AMQP_QUEUE_SUBSCRIPTIONS_EXPIRED_BILLING_PERIOD,
  AMQP_QUEUE_GENERATE_DAILY_SUBSCRIPTION_ORDERS,
};

const exchangesMap = {
  AMQP_TENANTS_EXCHANGE,
  AMQP_COMPANIES_DATA_EXCHANGE,
  AMQP_BUSINESS_UNITS_EXCHANGE,
  AMQP_HAULING_DEAD_LETTER,
};

const deadLetteredQueues = [
  AMQP_QUEUE_NOTIFY_CUSTOMERS,
  AMQP_QUEUE_DISPATCH_ORDERS,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_CORE,
  AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
  AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
  AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
  AMQP_QUEUE_WORK_ORDERS_FROM_RECYCLING,
];

const logError = error => logger.error(error);

const setupMq = async () => {
  if (SKIP_MQ_SETUP) {
    return logger.info('MQ: setup is skipped');
  }

  logger.info('MQ: Setting up exchanges and queues');

  const missedExchanges = Object.entries(exchangesMap)
    .filter(([, value]) => value == null)
    .map(([key]) => key);
  if (missedExchanges.length) {
    logger.error(`Exchanges ${missedExchanges.join(', ')} are missed in env vars`);
    // eslint-disable-next-line no-process-exit
    return process.exit(1);
  }

  const missedQueues = Object.entries(queuesMap)
    .filter(([, value]) => value == null)
    .map(([key]) => key);
  if (missedQueues.length) {
    logger.error(`Queues ${missedQueues.join(', ')} are missed in env vars`);
    // eslint-disable-next-line no-process-exit
    return process.exit(1);
  }

  const client = Client.getInstance();
  await client.connect();

  await Promise.all([
    client.assertQueue(AMQP_QUEUE_CUSTOMER_BALANCES, { singleConsumer: true }),
    client.assertQueue(AMQP_QUEUE_SALES_REP_HISTORY, { singleConsumer: true }),
    client.assertQueue(
      AMQP_QUEUE_NOTIFY_CUSTOMERS,
      {},
      {
        deadLetterExchange: AMQP_HAULING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_NOTIFY_CUSTOMERS,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_DISPATCH_ORDERS,
      {},
      {
        deadLetterExchange: AMQP_HAULING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_DISPATCH_ORDERS,
      },
    ),
    client.assertQueue(AMQP_QUEUE_GENERATE_SUBSCRIPTION_ORDERS),
    client.assertQueue(AMQP_QUEUE_GENERATE_SUBSCRIPTION_WOS),
    client.assertQueue(AMQP_QUEUE_FREQUENCY_PRORATION),

    client.assertQueue(AMQP_QUEUE_SUBSCRIPTIONS_EXPIRED_BILLING_PERIOD),

    client.assertQueue(AMQP_QUEUE_SUBSCRIPTIONS_PROLONGATION),
    client.assertQueue(AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH),
    client.assertQueue(AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH),

    ...(DISABLE_INDEPENDENT_ORDERS_SYNC_WITH_DISPATCH
      ? []
      : [
          client.assertQueue(AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH),
          client.assertQueue(AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH),
        ]),
    client.assertQueue(AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH),
    client.assertQueue(
      AMQP_QUEUE_RECURRENT_ORDERS_TO_CORE,
      {},
      {
        deadLetterExchange: AMQP_HAULING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_RECURRENT_ORDERS_TO_CORE,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
      {},
      {
        deadLetterExchange: AMQP_HAULING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
      {},
      {
        deadLetterExchange: AMQP_HAULING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
      {},
      {
        deadLetterExchange: AMQP_HAULING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
      },
    ),
    client.assertQueue(AMQP_QUEUE_END_SUBSCRIPTIONS),
    client.assertQueue(AMQP_QUEUE_WORK_ORDERS_TO_RECYCLING),
    client.assertQueue(AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS),
    client.assertQueue(
      AMQP_QUEUE_WORK_ORDERS_FROM_RECYCLING,
      {},
      {
        deadLetterExchange: AMQP_HAULING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_WORK_ORDERS_FROM_RECYCLING,
      },
    ),
    client.assertQueue(AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES),
    client.assertQueue(AMQP_QUEUE_WORK_ORDERS_TO_RECYCLING),
    client.assertQueue(AMQP_QUEUE_UPDATE_PRICE_GROUPS),
    client.assertQueue(AMQP_QUEUE_RESUME_SUBSCRIPTIONS_EMAIL_NOTIFICATION),
    client.assertQueue(AMQP_QUEUE_HOLD_CUSTOMER_EMAIL_NOTIFICATION),
    client.assertQueue(AMQP_QUEUE_GENERATE_REMINDERS),

    client.assertQueue(
      AMQP_QUEUE_GENERATE_DAILY_SUBSCRIPTION_ORDERS,
    ),
    client.channel.assertExchange(AMQP_TENANTS_EXCHANGE, 'direct'),
    client.channel.assertExchange(AMQP_COMPANIES_DATA_EXCHANGE, 'direct'),
    client.channel.assertExchange(AMQP_BUSINESS_UNITS_EXCHANGE, 'fanout'),
    client.channel.assertExchange(AMQP_HAULING_DEAD_LETTER, 'direct'),
    client.channel.assertExchange(AMQP_HISTORY_EXCHANGE, 'topic'),
  ]);

  await Promise.all([
    ...deadLetteredQueues.map(queue =>
      client.channel.bindQueue(queue, AMQP_HAULING_DEAD_LETTER, queue),
    ),
    client.channel.bindQueue(
      AMQP_QUEUE_SALES_REP_HISTORY,
      AMQP_HISTORY_EXCHANGE,
      AMQP_HISTORY_USERS_TOPIC,
    ),
  ]);

  // binding happens automatically since the default exchange

  await client.disconnect().catch(logError);

  logger.info('MQ: Running consuming method');

  // new consuming - new MQ receiver instance to re-use connection & channel right
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_CUSTOMER_BALANCES, updateCustomerBalance);
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_SALES_REP_HISTORY, updateSalesRep);
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_GENERATE_DAILY_SUBSCRIPTION_ORDERS,
    ordersGenerationSubscribers.generateSubscriptionOrdersDaily,
  );

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_NOTIFY_CUSTOMERS,
    notifyCustomers,
    AMQP_HAULING_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_DISPATCH_ORDERS,
    dispatchOrder,
    AMQP_HAULING_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_FREQUENCY_PRORATION, updateServiceItemPrice);
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_SUBSCRIPTIONS_EXPIRED_BILLING_PERIOD,
    subscriptionsExpiredBillingPeriod,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_SUBSCRIPTIONS_PROLONGATION,
    prolongateSubscriptions,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_GENERATE_SUBSCRIPTION_ORDERS,
    ordersGenerationSubscribers.generateSubscriptionOrders,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_GENERATE_SUBSCRIPTION_WOS,
    ordersGenerationSubscribers.generateSubscriptionWorkOrders,
  );
  if (ENABLE_SUBSCRIPTION_ORDERS_SYNC_STUB) {
    MqReceiver.getInstance().subscribe(
      AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH,
      routePlannerSubscribers.syncToDispatch,
    );
  }
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH,
    routePlannerSubscribers.syncFromDispatch,
  );

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH,
    routePlannerSubscribers.syncServiceItemsFromDispatch,
  );

  if (!DISABLE_INDEPENDENT_ORDERS_SYNC_WITH_DISPATCH) {
    MqReceiver.getInstance().subscribe(
      AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH,
      routePlannerSubscribers.syncIndependentFromDispatch,
    );
  }

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_RECURRENT_ORDERS_TO_CORE,
    generateTenantOrdersFromRecurrentOrderTemplates,
    AMQP_HAULING_DEAD_LETTER,
  );

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
    handleFailedOrSuccessfulRecurrentOrderPayment,
    AMQP_HAULING_DEAD_LETTER,
  );

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
    rollbackFailedToInvoiceOrders,
    AMQP_HAULING_DEAD_LETTER,
  );

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
    updateOrdersPaymentMethods,
    AMQP_HAULING_DEAD_LETTER,
  );

  MqReceiver.getInstance().subscribe(AMQP_QUEUE_END_SUBSCRIPTIONS, closeEndingSubscriptions);
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_WORK_ORDERS_FROM_RECYCLING,
    upsertLandfillOperation,
    AMQP_HAULING_DEAD_LETTER,
  );

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES,
    updateSubscriptionsByRatesChanges,
  );

  MqReceiver.getInstance().subscribe(AMQP_QUEUE_UPDATE_PRICE_GROUPS, updatePriceGroups);

  MqReceiver.getInstance().subscribe(AMQP_QUEUE_GENERATE_REMINDERS, generateReminders);

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_RESUME_SUBSCRIPTIONS_EMAIL_NOTIFICATION,
    notifyResumeSubscriptions,
  );

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_HOLD_CUSTOMER_EMAIL_NOTIFICATION,
    notifyHoldCustomer,
  );

  return logger.info('MQ: Setup is done');
};

const resetMq = async () => {
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

export default { sync: setupMq, reset: resetMq };
