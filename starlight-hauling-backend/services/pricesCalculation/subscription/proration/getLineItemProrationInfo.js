import { endOfDay, max as maxDate } from 'date-fns';
import calculateRecurringLineItemPrice from '../prices/recurringLineItemPrice.js';
import getProrationTotals from './getProrationTotals.js';

const getLineItemProrationInfo = async (
  ctx,
  {
    prorationType,
    serviceDaysOfWeek,
    lineItem,
    nextBillingPeriodFrom,
    nextBillingPeriodTo,
    periodFrom,
    periodTo,
    billingCycle,
    businessUnitId,
    businessLineId,
    customRatesGroupId,
    today,
    frequencyTimes,
    frequencyType,
    isLastProrationPeriodInBillingCycle,
  },
  dependencies,
) => {
  const {
    price: overriddenPrice,
    quantity,
    effectiveDate,
    lineItemId,
    billableLineItemId,
  } = lineItem;

  const specifiedDate = endOfDay(maxDate([periodFrom, today]));

  const {
    price,
    prevQuantity,
    prevProrationEffectiveDate,
    prevProrationEffectivePrice,
    prevProrationOverride,
  } = await calculateRecurringLineItemPrice(
    ctx,
    {
      price: overriddenPrice,
      specifiedDate,
      lineItemId,
      billableLineItemId,
      billingCycle,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
    },
    dependencies,
  );

  const prorationInfo = {
    effectiveDate,
    billableLineItemId,
    lineItemId,
    nextBillingPeriodFrom,
    nextBillingPeriodTo,
  };

  const prorationTotals = getProrationTotals({
    itemId: lineItemId,
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
  });

  return {
    ...prorationInfo,
    ...prorationTotals,
    prevProration: {
      effectiveDate: prevProrationEffectiveDate,
      effectivePrice: prevProrationEffectivePrice,
    },
  };
};

export default getLineItemProrationInfo;
