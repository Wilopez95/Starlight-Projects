import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  IInvoiceSubscriptionModel,
  IInvoiceSubscriptionResponse,
  ISubscriptionInvoiceServiceItemModel,
  ISubscriptionOrderInfo,
  ISubscriptionServiceItem,
  ReservedServiceNames,
} from '@root/modules/billing/Invoices/types';
import { JsonConversions } from '@root/types';

export const convertSubscriptionInvoiceEntityDates = (
  subscription: JsonConversions<IInvoiceSubscriptionResponse>,
): IInvoiceSubscriptionModel => {
  let linkedSubscriptionOrder: ISubscriptionOrderInfo[] = [];
  const serviceItemsData = subscription.serviceItems.reduce<ISubscriptionInvoiceServiceItemModel[]>(
    (res, serviceItem) => {
      if (serviceItem.serviceName === ReservedServiceNames.notService) {
        linkedSubscriptionOrder = [
          ...linkedSubscriptionOrder,
          ...serviceItem.serviceItems
            .map(item =>
              item.subscriptionOrders.map(elem => ({
                ...elem,
                serviceDate: substituteLocalTimeZoneInsteadUTC(elem.serviceDate),
              })),
            )
            .flat(),
        ];

        return res;
      }

      const serviceItems: ISubscriptionServiceItem[] = [];
      const subscriptionOrders = new Map<string, ISubscriptionOrderInfo>();

      serviceItem.serviceItems.forEach(item => {
        item.subscriptionOrders.forEach(elem => {
          subscriptionOrders.set(elem.id, {
            ...elem,
            serviceDate: substituteLocalTimeZoneInsteadUTC(elem.serviceDate),
          });
        });

        serviceItems.push({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          totalDay: item.totalDay,
          totalPrice: item.totalPrice,
          usageDay: item.usageDay,
          periodSince: substituteLocalTimeZoneInsteadUTC(item.periodSince),
          periodTo: substituteLocalTimeZoneInsteadUTC(item.periodTo),
        });
      });

      res.push({
        ...serviceItem,
        lineItems: serviceItem.lineItems.map(item => ({
          ...item,
          periodSince: substituteLocalTimeZoneInsteadUTC(item.periodSince),
          periodTo: substituteLocalTimeZoneInsteadUTC(item.periodTo),
        })),
        serviceItems,
        subscriptionOrders: Array.from(subscriptionOrders.values()),
      } as ISubscriptionInvoiceServiceItemModel);

      return res;
    },
    [],
  );

  return {
    ...subscription,
    endDate: subscription.endDate ? substituteLocalTimeZoneInsteadUTC(subscription.endDate) : null,
    nextBillingPeriodFrom: subscription.nextBillingPeriodFrom
      ? substituteLocalTimeZoneInsteadUTC(subscription.nextBillingPeriodFrom)
      : null,
    nextBillingPeriodTo: subscription.nextBillingPeriodTo
      ? substituteLocalTimeZoneInsteadUTC(subscription.nextBillingPeriodTo)
      : null,
    startDate: substituteLocalTimeZoneInsteadUTC(subscription.startDate),
    nonServiceOrder: [],
    linkedSubscriptionOrder,
    serviceItems: serviceItemsData,
  };
};
