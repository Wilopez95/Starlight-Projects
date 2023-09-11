import { ISubscriptionOrderLineItem } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IEntity } from '@root/types';

export interface ILineItemComponent {
  index: number;
  handleRemove(): void;
  lineItem: Omit<ISubscriptionOrderLineItem, keyof IEntity>;
  disabled?: boolean;
}
