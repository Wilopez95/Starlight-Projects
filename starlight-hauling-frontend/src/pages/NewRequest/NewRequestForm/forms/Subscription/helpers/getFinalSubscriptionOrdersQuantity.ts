import { BillableItemActionEnum } from '@root/consts';
import { IBillableService, ISubscriptionOrder } from '@root/types';

import { INewSubscriptionOrder } from '../types';

export const getFinalSubscriptionOrdersQuantity = (
  subscriptionOrders: (INewSubscriptionOrder | ISubscriptionOrder)[],
  billableServices: IBillableService[],
): number => {
  let finalSubscOrdersQuantity = 0;

  if (!subscriptionOrders?.length) {
    return finalSubscOrdersQuantity;
  }

  subscriptionOrders.forEach(subscriptionOrder => {
    let service;

    if ('billableService' in subscriptionOrder) {
      service = subscriptionOrder.billableService;
    } else {
      service = billableServices.find(serv => serv.id === subscriptionOrder?.billableServiceId);
    }

    if (service?.action === BillableItemActionEnum.final) {
      finalSubscOrdersQuantity += subscriptionOrder.quantity;
    }
  });

  return finalSubscOrdersQuantity;
};
