import { IInvoiceSubscriptionModel } from '@root/modules/billing/Invoices/types';
import { type Maybe } from '@root/types';
import { type IBillingCustomer } from '@root/types/queries';

export interface ISubscriptionExpandableRow {
  subscription: IInvoiceSubscriptionModel;
  customer: Maybe<IBillingCustomer>;
}
