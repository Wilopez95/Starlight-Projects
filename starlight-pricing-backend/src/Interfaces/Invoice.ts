import { ICustomerInvoicingInfo } from './Customer';

export interface ICustomersObject {
  onAccount: ICustomerInvoicingInfo | object;
  prepaid: ICustomerInvoicingInfo | object;
}

export interface IInvoicesData {
  invoicesCount: number;
}

export interface IAggregateInvoicing {
  onAccount: ICustomerInvoicingInfo[];
  prepaid: ICustomerInvoicingInfo[];
  customersCount: number;
  subscriptionsCount: number;
  ordersCount: number;
  invoicesTotal: number;
  processedTotal: number;
  processedSubscriptions: number;
  processedOrders: number;
  generatedInvoices: number;
}

export interface IAggregateInvoicingParams {
  customerSubscriptions: IAggregateInvoicing;
  customersOrders: IAggregateInvoicing;
}
