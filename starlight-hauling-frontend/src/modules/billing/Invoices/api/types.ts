import { Maybe } from '../../../../types';
import { IInvoice } from '../types';

export type AllInvoiceResponse = {
  invoices: IInvoice[];
  invoicesCount: number;
};

export type InvoiceByIdResponse = {
  invoice: Maybe<IInvoice>;
};

export type InvoicedOrderResponse = {
  order: {
    invoice: IInvoice;
  };
};

export type InvoicedSubscriptionOrderResponse = {
  invoiceBySubOrderId: IInvoice;
};

export type CustomerInvoicesResponse = {
  invoices: IInvoice[];
};
