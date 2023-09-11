import { parseDate } from '@root/core/helpers';
import { JsonConversions } from '@root/core/types';
import {
  IInvoiceSubscriptionModel,
  IInvoiceSubscriptionResponse,
  ISubscriptionInvoiceServiceItemModel,
  ISubscriptionOrderInfo,
  ISubscriptionServiceItem,
  ReservedServiceNames,
} from '@root/finance/types/entities';

export const convertSubscriptionInvoiceEntityDates = (
  subscription: JsonConversions<IInvoiceSubscriptionResponse>,
): IInvoiceSubscriptionModel => {
  let linkedSubscriptionOrder: ISubscriptionOrderInfo[] = [];
  const serviceItems = subscription.serviceItems.reduce((res, serviceItem) => {
    if (serviceItem.serviceName === ReservedServiceNames.notService) {
      linkedSubscriptionOrder = [
        ...linkedSubscriptionOrder,
        ...serviceItem.serviceItems
          .map((item) =>
            item.subscriptionOrders.map((elem) => ({
              ...elem,
              serviceDate: parseDate(elem.serviceDate),
            })),
          )
          .flat(),
      ];

      return res;
    }

    const serviceItems: ISubscriptionServiceItem[] = [];
    const subscriptionOrders = new Map<string, ISubscriptionOrderInfo>();

    serviceItem.serviceItems.forEach((item) => {
      item.subscriptionOrders.forEach((elem) => {
        subscriptionOrders.set(elem.id, {
          ...elem,
          serviceDate: parseDate(elem.serviceDate),
        });
      });

      serviceItems.push({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        totalDay: item.totalDay,
        totalPrice: item.totalPrice,
        usageDay: item.usageDay,
        periodSince: parseDate(item.periodSince),
        periodTo: parseDate(item.periodTo),
      });
    });

    res.push({
      ...serviceItem,
      lineItems: serviceItem.lineItems.map((item) => ({
        ...item,
        periodSince: parseDate(item.periodSince),
        periodTo: parseDate(item.periodTo),
      })),
      serviceItems,
      subscriptionOrders: Array.from(subscriptionOrders.values()),
    } as ISubscriptionInvoiceServiceItemModel);

    return res;
  }, [] as ISubscriptionInvoiceServiceItemModel[]);

  return {
    ...subscription,
    endDate: subscription.endDate ? parseDate(subscription.endDate) : null,
    nextBillingPeriodFrom: subscription.nextBillingPeriodFrom
      ? parseDate(subscription.nextBillingPeriodFrom)
      : null,
    nextBillingPeriodTo: subscription.nextBillingPeriodTo
      ? parseDate(subscription.nextBillingPeriodTo)
      : null,
    startDate: parseDate(subscription.startDate),
    nonServiceOrder: subscription.nonServiceOrder.map((item) => ({
      ...item,
      serviceDate: parseDate(item.serviceDate),
    })),
    linkedSubscriptionOrder,
    serviceItems,
  };
};
