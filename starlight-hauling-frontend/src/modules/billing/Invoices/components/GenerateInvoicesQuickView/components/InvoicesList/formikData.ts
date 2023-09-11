import { isEmpty, keyBy, sortBy } from 'lodash-es';

import { InvoicingData } from '../../../../../../../api';
import { type FormikInvoicingData } from '../../types';

const defaultInvoicingData: FormikInvoicingData = {
  onAccount: [],
  prepaid: [],
  processedOrders: 0,
  processedSubscriptions: 0,
  generatedInvoices: 0,
  customersCount: 0,
  invoicesTotal: 0,
};

export const getValues = (data?: InvoicingData): FormikInvoicingData => {
  if (!data) {
    return defaultInvoicingData;
  }

  return {
    ...data,
    onAccount: sortBy(
      data.onAccount.map(customer => ({
        ...customer,
        overlimitOrders: keyBy(customer.overlimitOrders, 'id'),
        overpaidOrders: keyBy(customer.overpaidOrders, 'id'),
        drafts: {
          orders:
            customer.drafts.orders?.map(draft => ({
              ...draft,
              attachTicketPref: customer.attachTicketPref,
              attachMediaPref: customer.attachMediaPref,
            })) ?? [],
          subscriptions:
            customer.drafts.subscriptions?.map(draft => ({
              ...draft,
              attachMediaPref: customer.attachMediaPref,
            })) ?? [],
        },
      })),
      customer => isEmpty(customer.overlimitOrders),
    ),
    prepaid: sortBy(
      data.prepaid.map(customer => ({
        ...customer,
        overlimitOrders: keyBy(customer.overlimitOrders, 'id'),
        overpaidOrders: keyBy(customer.overpaidOrders, 'id'),
        drafts: {
          orders:
            customer.drafts.orders?.map(draft => ({
              ...draft,
              attachTicketPref: customer.attachTicketPref,
              attachMediaPref: customer.attachMediaPref,
            })) ?? [],
          subscriptions:
            customer.drafts.subscriptions?.map(draft => ({
              ...draft,
              attachMediaPref: customer.attachMediaPref,
            })) ?? [],
        },
      })),
      customer => isEmpty(customer.overlimitOrders),
    ),
  };
};
