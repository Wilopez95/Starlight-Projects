import { isToday } from 'date-fns';

import { AUTO_PAY_TYPES } from '../consts/customerAutoPayTypes.js';
import ApplicationError from '../errors/ApplicationError.js';

const FILTERS_TYPES = {
  notClosed: 'notClosed',
  applied: 'applied',
  cod: 'cod',
};

const filterMethods = {
  [FILTERS_TYPES.notClosed]: ({ balance }) => Number(balance) > 0,
  [FILTERS_TYPES.applied]: ({ invoiceCustomerId, customerId }) =>
    Number(invoiceCustomerId) === Number(customerId),
  [FILTERS_TYPES.cod]: ({ dueDate }) => isToday(dueDate),
};

const filterInvoices = ({ invoices, customerId, filtersList }) =>
  invoices.filter(({ customerId: invoiceCustomerId, balance, dueDate }) => {
    const data = { customerId, invoiceCustomerId, balance, dueDate };
    return filtersList.every(name => filterMethods[name](data));
  });

export const filterByCustomerAutoPayType = (invoices, customer) => {
  const { id: customerId, autopayType } = customer;
  let filteredInvoices;

  switch (autopayType) {
    case AUTO_PAY_TYPES.lastInvoice: {
      filteredInvoices = filterInvoices({
        invoices,
        customerId,
        filtersList: [FILTERS_TYPES.notClosed, FILTERS_TYPES.applied, FILTERS_TYPES.cod],
      });
      break;
    }

    case AUTO_PAY_TYPES.invoiceDue: {
      filteredInvoices = filterInvoices({
        invoices,
        customerId,
        filtersList: [FILTERS_TYPES.notClosed, FILTERS_TYPES.applied, FILTERS_TYPES.cod],
      });
      break;
    }

    case AUTO_PAY_TYPES.accountBalance: {
      filteredInvoices = filterInvoices({
        invoices,
        customerId,
        filtersList: [FILTERS_TYPES.notClosed, FILTERS_TYPES.applied],
      });
      break;
    }

    default: {
      throw ApplicationError.unknown(`Auto Pay status "${autopayType}" is not supported.`);
    }
  }

  return filteredInvoices;
};

export const getAutoPayApplicationsData = ({ invoices, customerId }) =>
  invoices.reduce(
    (acc, invoice) => {
      const { id: invoiceId, customerId: invoiceCustomerId, balance } = invoice;
      const isApplied = Number(customerId) === Number(invoiceCustomerId);
      if (!isApplied) {
        return acc;
      }

      acc.invoiceIds.push(invoiceId);
      acc.applications.push({
        invoiceId,
        amount: Number(balance),
      });
      return acc;
    },
    {
      invoiceIds: [],
      applications: [],
    },
  );
