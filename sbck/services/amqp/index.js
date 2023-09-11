import { logger } from '../../utils/logger.js';

import {
  SKIP_MQ_SETUP,
  AMQP_QUEUE_CUSTOMER_BALANCES,
  AMQP_QUEUE_REQUEST_SETTLEMENTS,
  AMQP_QUEUE_ORDER_TOTALS_TO_BILLING,
  AMQP_QUEUE_DISPATCH_ORDERS,
  AMQP_QUEUE_CHARGE_DEFERRED_PAYMENTS,
  AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
  AMQP_QUEUE_LOCK_BANK_DEPOSITS,
  AMQP_QUEUE_BUSINESS_UNITS,
  AMQP_QUEUE_JOB_SITES_TO_BILLING,
  AMQP_QUEUE_CUSTOMERS_TO_BILLING,
  AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
  AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
  AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING,
  AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
  AMQP_QUEUE_BUSINESS_LINES,
  AMQP_QUEUE_AUTO_PAY_INVOICES,
  AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS,
  AMQP_TENANTS_EXCHANGE,
  AMQP_COMPANIES_DATA_EXCHANGE,
  AMQP_BILLING_DEAD_LETTER,
  AMQP_HISTORY_EXCHANGE,
  AMQP_HISTORY_USERS_TOPIC,
} from '../../config.js';
import {
  updateOrderTotals,
  updateCompany,
  upsertBusinessUnit,
  autoRequestSettlements,
  chargeDeferredPayments,
  lockBankDeposits,
  upsertCustomerJobSitePair,
  upsertJobSite,
  upsertCustomer,
  createPaymentsForRecurrentOrders,
  createTenant,
  lineOfBusiness,
  autoPayInvoices,
  deleteTenant,
  updateBusinessUnitMailSettings,
  createUserFolderOnExago,
} from './subscriptions.js';

import Client from './client.js';
import MqReceiver from './receiver.js';

const queuesMap = {
  SKIP_MQ_SETUP,
  AMQP_QUEUE_CUSTOMER_BALANCES,
  AMQP_QUEUE_REQUEST_SETTLEMENTS,
  AMQP_QUEUE_ORDER_TOTALS_TO_BILLING,
  AMQP_QUEUE_DISPATCH_ORDERS,
  AMQP_QUEUE_CHARGE_DEFERRED_PAYMENTS,
  AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
  AMQP_QUEUE_LOCK_BANK_DEPOSITS,
  AMQP_QUEUE_BUSINESS_UNITS,
  AMQP_QUEUE_JOB_SITES_TO_BILLING,
  AMQP_QUEUE_CUSTOMERS_TO_BILLING,
  AMQP_QUEUE_RECURRENT_ORDERS_BILLING_STATUS,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
  AMQP_QUEUE_FAILED_INVOICE_ORDERS_TO_CORE,
  AMQP_QUEUE_INVOICED_ORDERS_TO_RECYCLING,
  AMQP_QUEUE_PAYMENT_METHODS_TO_CORE,
  AMQP_QUEUE_BUSINESS_LINES,
  AMQP_QUEUE_AUTO_PAY_INVOICES,
  AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS,
  AMQP_HISTORY_USERS_TOPIC,
};

const exchangesMap = {
  AMQP_TENANTS_EXCHANGE,
  AMQP_BILLING_DEAD_LETTER,
  AMQP_HISTORY_EXCHANGE,
  AMQP_COMPANIES_DATA_EXCHANGE,
};

const CREATE_TENANTS_QUEUE = 'tenants.updates.create';
const DELETE_TENANTS_QUEUE = 'tenants.updates.delete';
const UPDATE_COMPANY_DATA_QUEUE = 'companies.updates.update';

const deadLetteredQueues = [
  AMQP_QUEUE_BUSINESS_UNITS,
  AMQP_QUEUE_REQUEST_SETTLEMENTS,
  AMQP_QUEUE_CHARGE_DEFERRED_PAYMENTS,
  AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
  AMQP_QUEUE_LOCK_BANK_DEPOSITS,
  AMQP_QUEUE_JOB_SITES_TO_BILLING,
  AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
  AMQP_HISTORY_USERS_TOPIC,
  CREATE_TENANTS_QUEUE,
  DELETE_TENANTS_QUEUE,
];

const logError = err => logger.error(err);

export const setupMq = async () => {
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

  // create queues for the default exchange
  await Promise.all([
    client.assertQueue(AMQP_QUEUE_ORDER_TOTALS_TO_BILLING),
    client.assertQueue(
      AMQP_QUEUE_REQUEST_SETTLEMENTS,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        // use for routing key queue name itself
        deadLetterRoutingKey: AMQP_QUEUE_REQUEST_SETTLEMENTS,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_BUSINESS_UNITS,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_BUSINESS_UNITS,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_CHARGE_DEFERRED_PAYMENTS,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_CHARGE_DEFERRED_PAYMENTS,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_LOCK_BANK_DEPOSITS,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_LOCK_BANK_DEPOSITS,
      },
    ),
    client.assertQueue(
      AMQP_QUEUE_JOB_SITES_TO_BILLING,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        // use for routing key queue name itself
        deadLetterRoutingKey: AMQP_QUEUE_JOB_SITES_TO_BILLING,
      },
    ),
    client.assertQueue(AMQP_QUEUE_CUSTOMERS_TO_BILLING),
    client.assertQueue(
      AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        deadLetterRoutingKey: AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
      },
    ),
    client.assertQueue(
      CREATE_TENANTS_QUEUE,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        deadLetterRoutingKey: CREATE_TENANTS_QUEUE,
      },
    ),
    client.assertQueue(
      DELETE_TENANTS_QUEUE,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        deadLetterRoutingKey: DELETE_TENANTS_QUEUE,
      },
    ),
    client.assertQueue(AMQP_QUEUE_BUSINESS_LINES),
    client.assertQueue(AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS),
    client.assertQueue(AMQP_QUEUE_AUTO_PAY_INVOICES),
    client.assertQueue(
      UPDATE_COMPANY_DATA_QUEUE,
      {},
      {
        deadLetterExchange: AMQP_BILLING_DEAD_LETTER,
        deadLetterRoutingKey: UPDATE_COMPANY_DATA_QUEUE,
      },
    ),
    client.channel.assertExchange(AMQP_BILLING_DEAD_LETTER, 'direct'),
    client.channel.assertExchange(AMQP_TENANTS_EXCHANGE, 'direct'),
    client.channel.assertExchange(AMQP_COMPANIES_DATA_EXCHANGE, 'direct'),
    client.channel.assertExchange(AMQP_HISTORY_EXCHANGE, 'topic'),
    client.assertQueue(AMQP_HISTORY_USERS_TOPIC),
  ]);

  await Promise.all([
    client.channel.bindQueue(AMQP_HISTORY_USERS_TOPIC, AMQP_HISTORY_EXCHANGE, 'ums.user'),
    client.channel.bindQueue(CREATE_TENANTS_QUEUE, AMQP_TENANTS_EXCHANGE, 'create'),
    client.channel.bindQueue(DELETE_TENANTS_QUEUE, AMQP_TENANTS_EXCHANGE, 'delete'),
    client.channel.bindQueue(UPDATE_COMPANY_DATA_QUEUE, AMQP_COMPANIES_DATA_EXCHANGE, 'update'),
    ...deadLetteredQueues.map(queue =>
      client.channel.bindQueue(queue, AMQP_BILLING_DEAD_LETTER, queue),
    ),
  ]);

  // binding happens automatically since the default exchange

  await client.disconnect().catch(logError);

  logger.info('MQ: Running consuming method');

  // new consuming - new MQ receiver instance to re-use connection & channel right
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_ORDER_TOTALS_TO_BILLING, updateOrderTotals);
  MqReceiver.getInstance().subscribe(
    UPDATE_COMPANY_DATA_QUEUE,
    updateCompany,
    AMQP_BILLING_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_BUSINESS_UNITS,
    upsertBusinessUnit,
    AMQP_BILLING_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_REQUEST_SETTLEMENTS,
    autoRequestSettlements,
    AMQP_BILLING_DEAD_LETTER,
    true,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_CHARGE_DEFERRED_PAYMENTS,
    chargeDeferredPayments,
    AMQP_BILLING_DEAD_LETTER,
    true,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_LOCK_BANK_DEPOSITS,
    lockBankDeposits,
    AMQP_BILLING_DEAD_LETTER,
    true,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
    upsertCustomerJobSitePair,
    AMQP_BILLING_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_JOB_SITES_TO_BILLING,
    upsertJobSite,
    AMQP_BILLING_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(AMQP_QUEUE_CUSTOMERS_TO_BILLING, upsertCustomer);

  MqReceiver.getInstance().subscribe(AMQP_QUEUE_BUSINESS_LINES, lineOfBusiness);

  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_RECURRENT_ORDERS_TO_BILLING,
    createPaymentsForRecurrentOrders,
    AMQP_BILLING_DEAD_LETTER,
  );
  MqReceiver.getInstance().subscribe(CREATE_TENANTS_QUEUE, createTenant, AMQP_BILLING_DEAD_LETTER);
  MqReceiver.getInstance().subscribe(DELETE_TENANTS_QUEUE, deleteTenant, AMQP_BILLING_DEAD_LETTER);
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_BUSINESS_UNITS_MAIL_SETTINGS,
    updateBusinessUnitMailSettings,
  );
  MqReceiver.getInstance().subscribe(
    AMQP_QUEUE_AUTO_PAY_INVOICES,
    autoPayInvoices,
    undefined,
    true,
  );
  MqReceiver.getInstance().subscribe(AMQP_HISTORY_USERS_TOPIC, createUserFolderOnExago);

  logger.info('MQ: Setup is done');
  return true;
};

export const resetMq = async () => {
  logger.info('MQ: Resetting queues');
  const queuesList = Object.values(queuesMap);
  const exchangesList = Object.values(exchangesMap);

  const client = Client.getInstance();
  await client.connect();

  await Promise.all(queuesList.map(i => client.deleteQueue(i)));

  await Promise.all(exchangesList.map(i => client.deleteExchange(i)));

  await client.disconnect().catch(logError);

  logger.info('MQ: Reset is done');
};

export default { sync: setupMq, reset: resetMq };
