import { ENV_NAME } from '../config.js';
import { logger } from '../utils/logger.js';

const DELIVERED = 'delivered';
const FAILED_TO_DELIVER_STATUSES = ['dropped', 'bounce', 'blocked'];

export const processSendGridEvents = events =>
  events.reduce((acc, event) => {
    const { subscriberName, env, invoiceIds, statementIds, financeChargeIds } = event;

    if (
      env !== ENV_NAME ||
      !subscriberName ||
      (!invoiceIds && !statementIds && !financeChargeIds)
    ) {
      logger.info(event, 'Skipping SendGrid event');
      return acc;
    }

    if (!acc[subscriberName]) {
      acc[subscriberName] = {
        deliveredInvoices: [],
        failedToDeliverInvoices: [],
        deliveredStatements: [],
        failedToDeliverStatements: [],
        deliveredFinanceCharges: [],
        failedToDeliverFinanceCharges: [],
      };
    }

    if (event.event === DELIVERED) {
      invoiceIds
        ? acc[subscriberName].deliveredInvoices.push(...invoiceIds)
        : statementIds
        ? acc[subscriberName].deliveredStatements.push(...statementIds)
        : acc[subscriberName].deliveredFinanceCharges.push(...financeChargeIds);
    } else if (FAILED_TO_DELIVER_STATUSES.includes(event.event)) {
      invoiceIds
        ? acc[subscriberName].failedToDeliverInvoices.push(...invoiceIds)
        : statementIds
        ? acc[subscriberName].failedToDeliverStatements.push(...statementIds)
        : acc[subscriberName].failedToDeliverFinanceCharges.push(...financeChargeIds);
      logger.info(event, 'Failed to deliver email');
    }

    return acc;
  }, {});
