import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  ILineItemProrationInfo,
  IProrationInfo,
  IServiceItemProration,
  IServiceItemProrationInfo,
  ISubscriptionCalculations,
  ISubscriptionOrderSummary,
  JsonConversions,
} from '@root/types';

const parseLineItemProrationInfo = ({
  effectiveDate,
  periodFrom,
  periodTo,
  nextBillingPeriodFrom,
  nextBillingPeriodTo,
  ...lineItemProration
}: JsonConversions<ILineItemProrationInfo>): ILineItemProrationInfo => ({
  effectiveDate: substituteLocalTimeZoneInsteadUTC(effectiveDate),
  periodFrom: substituteLocalTimeZoneInsteadUTC(periodFrom),
  periodTo: substituteLocalTimeZoneInsteadUTC(periodTo),
  nextBillingPeriodFrom: substituteLocalTimeZoneInsteadUTC(nextBillingPeriodFrom),
  nextBillingPeriodTo: substituteLocalTimeZoneInsteadUTC(nextBillingPeriodTo),
  ...lineItemProration,
});

const convertSubscriptionOrderSummary = ({
  serviceDate,
  ...subscriptionOrder
}: JsonConversions<ISubscriptionOrderSummary>): ISubscriptionOrderSummary => ({
  ...subscriptionOrder,
  serviceDate: substituteLocalTimeZoneInsteadUTC(serviceDate),
});

const parseServiceItemProration = ({
  effectiveDate,
  periodFrom,
  periodTo,
  nextBillingPeriodFrom,
  nextBillingPeriodTo,
  ...serviceItemProrationInfo
}: JsonConversions<IServiceItemProrationInfo>): IServiceItemProrationInfo => ({
  effectiveDate: substituteLocalTimeZoneInsteadUTC(effectiveDate),
  periodFrom: substituteLocalTimeZoneInsteadUTC(periodFrom),
  periodTo: substituteLocalTimeZoneInsteadUTC(periodTo),
  nextBillingPeriodFrom: substituteLocalTimeZoneInsteadUTC(nextBillingPeriodFrom),
  nextBillingPeriodTo: substituteLocalTimeZoneInsteadUTC(nextBillingPeriodTo),
  ...serviceItemProrationInfo,
});

const parseProrationInfo = ({
  nextBillingPeriodFrom,
  nextBillingPeriodTo,
  lineItemsProrationInfo,
  serviceItemProrationInfo,
  subscriptionOrders = [],
  ...prorationInfo
}: JsonConversions<IProrationInfo>): IProrationInfo => ({
  lineItemsProrationInfo: lineItemsProrationInfo.map(parseLineItemProrationInfo),
  serviceItemProrationInfo: serviceItemProrationInfo
    ? parseServiceItemProration(serviceItemProrationInfo)
    : null,
  nextBillingPeriodFrom: substituteLocalTimeZoneInsteadUTC(nextBillingPeriodFrom),
  nextBillingPeriodTo: substituteLocalTimeZoneInsteadUTC(nextBillingPeriodTo),
  subscriptionOrders: subscriptionOrders.map(convertSubscriptionOrderSummary),
  ...prorationInfo,
});

const parseProrationPeriod = ({
  periodFrom,
  periodTo,
  nextBillingPeriodFrom,
  nextBillingPeriodTo,
  lineItemsProrationInfo,
  serviceItemProrationInfo,
  subscriptionOrders,
  ...prorationInfo
}: JsonConversions<IServiceItemProration>): IServiceItemProration => ({
  lineItemsProrationInfo: (lineItemsProrationInfo ?? []).map(parseLineItemProrationInfo),
  serviceItemProrationInfo: serviceItemProrationInfo
    ? parseServiceItemProration(serviceItemProrationInfo)
    : undefined,
  subscriptionOrders: (subscriptionOrders ?? []).map(convertSubscriptionOrderSummary),
  nextBillingPeriodFrom: substituteLocalTimeZoneInsteadUTC(nextBillingPeriodFrom),
  nextBillingPeriodTo: substituteLocalTimeZoneInsteadUTC(nextBillingPeriodTo),
  periodFrom: substituteLocalTimeZoneInsteadUTC(periodFrom),
  periodTo: substituteLocalTimeZoneInsteadUTC(periodTo),
  ...prorationInfo,
});

export const convertCalculationDates = ({
  subscriptionPrices,
  subscriptionPriceCalculation,
}: JsonConversions<ISubscriptionCalculations>): ISubscriptionCalculations => ({
  subscriptionPrices,
  subscriptionPriceCalculation: {
    ...subscriptionPriceCalculation,
    prorationInfo: subscriptionPriceCalculation.prorationInfo.map(item =>
      item.map(parseProrationInfo),
    ),
    prorationPeriods: subscriptionPriceCalculation.prorationPeriods.map(billingCycles =>
      billingCycles.map(prorationPeriods => prorationPeriods.map(parseProrationPeriod)),
    ),
  },
});
