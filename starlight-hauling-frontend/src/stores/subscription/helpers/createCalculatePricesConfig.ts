import { isSubscriptionDraft } from '@root/helpers';
import { ICalculateSubscriptionPricesConfig, ISubscription, ISubscriptionDraft } from '@root/types';

export const createCalculatePricesConfig = (
  subscription: ISubscription | ISubscriptionDraft,
): ICalculateSubscriptionPricesConfig => {
  return {
    customerId: subscription.customer.id,
    customerJobSiteId: isSubscriptionDraft(subscription)
      ? null
      : subscription.customerJobSite?.id ?? null,
    businessUnitId: subscription.businessUnit.id,
    businessLineId: subscription.businessLine.id,
    billingCycle: subscription.billingCycle,
    jobSiteId: subscription.jobSite.originalId,
    anniversaryBilling: subscription.anniversaryBilling,
    customRatesGroupId: subscription.customRatesGroup?.id ?? null,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    billingCycleCount: 2,
    serviceItems: subscription.serviceItems.map(serviceItem => ({
      serviceItemId: serviceItem.id,
      billableServiceId: serviceItem.billableServiceId,
      materialId: serviceItem.material.id,
      serviceFrequencyId: serviceItem.serviceFrequency?.[0]?.id
        ? +serviceItem.serviceFrequency?.[0]?.id
        : null,
      serviceDaysOfWeek: serviceItem.serviceDaysOfWeek ?? null,
      price: serviceItem.price,
      quantity: +serviceItem.quantity,
      prorationType: serviceItem.billableService.prorationType ?? null,
      effectiveDate: serviceItem.effectiveDate,
      lineItems: serviceItem.lineItems.map(lineItem => ({
        lineItemId: lineItem.id,
        billableLineItemId: lineItem.billableLineItem?.id ?? null,
        price: lineItem.price || null,
        quantity: lineItem.quantity,
      })),
      subscriptionOrders: serviceItem.subscriptionOrders.map(subscriptionOrder => ({
        subscriptionOrderId: subscriptionOrder.id,
        billableServiceId: subscriptionOrder.billableServiceId,
        serviceDate: subscriptionOrder.serviceDate,
        price: subscriptionOrder.price,
        quantity: subscriptionOrder.quantity,
      })),
    })),
  };
};
