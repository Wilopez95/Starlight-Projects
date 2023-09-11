import { endOfDay, max as maxDate } from 'date-fns';
import calculateRecurringServiceItemPrice from '../prices/recurringServiceItemPrice.js';
import getProrationTotals from './getProrationTotals.js';

const getServiceItemProrationInfo = async (
  ctx,
  {
    serviceItem,
    billingCycle,
    nextBillingPeriodFrom,
    nextBillingPeriodTo,
    periodFrom,
    periodTo,
    businessUnitId,
    businessLineId,
    customRatesGroupId,
    subscriptionOrdersTotal,
    billableServiceInclusions,
    today,
    isLastProrationPeriodInBillingCycle,
    oldServiceItems,
  },
  dependencies,
) => {
  const {
    price: overriddenPrice,
    quantity,
    effectiveDate,
    materialId,
    serviceItemId,
    serviceFrequencyId,
    billableServiceId,
    prorationType,
    serviceDaysOfWeek,
  } = serviceItem;

  const specifiedDate = endOfDay(maxDate([periodFrom, today]));

  const {
    price,
    prevQuantity,
    frequencyTimes,
    frequencyType,
    prevProrationEffectiveDate,
    prevProrationEffectivePrice,
    prevProrationOverride,
  } = await calculateRecurringServiceItemPrice(
    ctx,
    {
      price: overriddenPrice,
      specifiedDate,
      materialId,
      serviceItemId,
      serviceFrequencyId,
      billableServiceId,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      billableServiceInclusions,
    },
    dependencies,
  );

  const prorationInfo = {
    effectiveDate,
    billableServiceId,
    serviceItemId,
    nextBillingPeriodFrom,
    nextBillingPeriodTo,
    materialId,
  };

  const prorationTotals = getProrationTotals({
    itemId: serviceItemId,
    billingCycle,
    prorationType,
    serviceDaysOfWeek,
    effectiveDate,
    nextBillingPeriodTo,
    nextBillingPeriodFrom,
    periodFrom,
    periodTo,
    price,
    quantity,
    prevQuantity,
    frequencyTimes,
    frequencyType,
    isLastProrationPeriodInBillingCycle,
    prevProrationEffectiveDate,
    prevProrationEffectivePrice,
    prevProrationOverride,
    oldServiceItems,
  });
  return {
    serviceItemProrationInfo: {
      ...prorationInfo,
      ...prorationTotals,
      subscriptionOrdersTotal,
    },
    frequency: {
      frequencyTimes,
      frequencyType,
    },
    prevProration: {
      effectiveDate: prevProrationEffectiveDate,
      effectivePrice: prevProrationEffectivePrice,
    },
  };
};

export default getServiceItemProrationInfo;
