import { ISubscriptionLineItem } from '@root/finance/types/entities';

export interface ILineItemRow {
  lineItem: Partial<ISubscriptionLineItem> & { serviceDate?: Date };
}
