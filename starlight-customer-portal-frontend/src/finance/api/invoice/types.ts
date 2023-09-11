import { Maybe } from '@root/core/types';
import { IInvoice } from '@root/finance/types/entities';

export type InvoiceByIdResponse = {
  invoice: Maybe<IInvoice>;
};

export type InvoicedOrderResponse = {
  order: {
    invoice: IInvoice;
  };
};

export type CustomerInvoicesResponse = {
  invoices: IInvoice[];
  invoicesCount: number;
};
