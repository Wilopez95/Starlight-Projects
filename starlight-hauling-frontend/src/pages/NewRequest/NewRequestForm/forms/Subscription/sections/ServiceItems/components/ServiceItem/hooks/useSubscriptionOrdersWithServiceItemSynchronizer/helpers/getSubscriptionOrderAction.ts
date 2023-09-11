import { BillableItemActionEnum } from '@root/consts';
import { INewSubscriptionService } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const getSubscriptionOrderAction = (
  serviceItemQuantity: number,
  initialServiceItem?: INewSubscriptionService,
) => {
  if (
    !initialServiceItem ||
    initialServiceItem.id === 0 ||
    serviceItemQuantity > initialServiceItem.quantity
  ) {
    return BillableItemActionEnum.delivery;
  }

  if (serviceItemQuantity < initialServiceItem.quantity) {
    return BillableItemActionEnum.final;
  }

  return null;
};
