import { ISubscriptionOrderLineItem } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IEntity } from '@root/types';

export interface ILineItemComponent {
  index: number;
  lineItem: Omit<ISubscriptionOrderLineItem, keyof IEntity>;
  handleRemove(): void;
}
export interface IDefaultLineItem {
  quantity: number;
  billableLineItemId?: number;
  price?: number;
  materialId?: number | null;
  historicalLineItem?: {
    unit: string;
    originalId?: number;
  };
}
