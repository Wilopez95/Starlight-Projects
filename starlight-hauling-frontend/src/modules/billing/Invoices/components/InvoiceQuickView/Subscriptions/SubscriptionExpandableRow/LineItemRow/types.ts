import { ISubscriptionLineItem } from '@root/modules/billing/Invoices/types';

export interface ILineItemRow {
  lineItem: Partial<ISubscriptionLineItem> & { serviceDate?: Date };
}
