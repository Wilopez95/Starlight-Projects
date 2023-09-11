import { startOfDay, endOfDay, compareAsc, isEqual } from 'date-fns';
import uniqWith from 'lodash/uniqWith.js';
import merge from 'lodash/merge.js';
import getBillingPeriodsWithProration from '../proration/getBillingPeriodsWithProration.js';
import getReviewProrationInfo from '../proration/getProrationInfo.js';
import getServicesTotal from '../common/getServicesTotal.js';
import getLineItemsTotal from '../common/getLineItemsTotal.js';
import getSubscriptionOrdersTotal from '../common/getSubscriptionOrdersTotal.js';
import getProratedTotalForBillingPeriod from '../common/getProratedTotalForBillingPeriod.js';
import getProratedRecurringTotalForBillingPeriod from '../common/getProratedRecurringTotalForBillingPeriod.js';
import { getGrandTotal } from '../../common/getTotals.js';
import getTaxesInfo from '../taxes/getTaxesInfo.js';
import getSurchargesInfo from '../surcharges/getSurchargesInfo.js';
import getServiceItemsByBillingPeriods from './getServiceItemsByBillingPeriods.js';
import getProrationPeriods from './getProrationPeriods.js';
import getEffectiveDates from './getEffectiveDates.js';
import getBillingPeriodsByEffectiveDates from './getBillingPeriodsByEffectiveDates.js';
import getBillingPeriodsSinceDate from './getBillingPeriodsSinceDate.js';
import { outputProrationPeriods, outputProrationInfo } from './outputDecorators.js';

const concatBillingPeriods = (...billingPeriods) => {
  const flattened = billingPeriods.flat();
  const sorted = flattened.sort((left, right) =>
    compareAsc(left.nextBillingPeriodFrom, right.nextBillingPeriodFrom),
  );
  const uniq = uniqWith(sorted, (left, right) =>
    isEqual(left.nextBillingPeriodFrom, right.nextBillingPeriodFrom),
  );

  return uniq;
};

const getSubscriptionSummary = async (
  ctx,
  {
    billingCycle,
    anniversaryBilling,
    startDate,
    endDate,
    businessUnitId,
    businessLineId,
    customRatesGroupId,
    serviceItems = [],
    serviceItemsWithCurrentPrices = [],
    billableServiceInclusions = {},
    needRecalculateSurcharge,
    applySurcharges,
    subscriptionId,
    jobSiteId,
    customerId,
    today,
  },
  dependencies,
) => {
  const subscriptionStartDate = startDate ? startOfDay(startDate) : startOfDay(today);
  const subscriptionEndDate = endDate && endOfDay(endDate);

  const currentAndNextBillingPeriods = getBillingPeriodsSinceDate({
    sinceDate: today,
    billingCycleCount: 2,
    billingCycle,
    anniversaryBilling,
    subscriptionStartDate,
    subscriptionEndDate,
  });

  const effectiveDates = getEffectiveDates(serviceItems);
  const billingPeriodsByEffectiveDates = getBillingPeriodsByEffectiveDates({
    billingCycle,
    anniversaryBilling,
    subscriptionStartDate,
    subscriptionEndDate,
    effectiveDates,
  });

  const billingPeriods = concatBillingPeriods(
    currentAndNextBillingPeriods,
    billingPeriodsByEffectiveDates,
  );

  const prorationPeriods = getProrationPeriods({
    billingPeriods,
    subscriptionStartDate,
    subscriptionEndDate,
    effectiveDates,
  });

  const billingPeriodsWithProration = await getBillingPeriodsWithProration(
    ctx,
    {
      billingCycle,
      prorationPeriods,
      serviceItems,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      billableServiceInclusions,
      today,
    },
    dependencies,
  );

  const serviceItemsByBillingPeriods = getServiceItemsByBillingPeriods(billingPeriodsWithProration);

  const reviewProrationInfo = getReviewProrationInfo(serviceItemsByBillingPeriods);

  const [firstBillingPeriod, secondBillingPeriod] = billingPeriodsWithProration;
  const [currentServiceItems] = serviceItemsByBillingPeriods;

  const { subscriptionSurcharges, totalSurcharge, serviceItemTotals } = await getSurchargesInfo(
    ctx,
    {
      needRecalculateSurcharge,
      serviceItems: currentServiceItems,
      applySurcharges,
      businessLineId,
      businessUnitId,
      subscriptionId,
      billingCycle,
      customRatesGroupId,
    },
    dependencies,
  );

  if (totalSurcharge) {
    merge(currentServiceItems, serviceItemTotals);
  }

  const taxesInfo = await getTaxesInfo(
    ctx,
    {
      serviceItems: currentServiceItems,
      jobSiteId,
      customerId,
      businessLineId,
    },
    dependencies,
  );

  const summaryForFirstBillingPeriod = getProratedTotalForBillingPeriod(firstBillingPeriod);
  const grandTotal = getGrandTotal(summaryForFirstBillingPeriod, taxesInfo.taxesTotal);
  const recurringSummaryForFirstBillingPeriod =
    getProratedRecurringTotalForBillingPeriod(firstBillingPeriod);
  const recurringGrandTotal = getGrandTotal(
    recurringSummaryForFirstBillingPeriod,
    taxesInfo.recurringTaxesTotal,
  );

  return {
    prorationPeriods: outputProrationPeriods(billingPeriodsWithProration),
    prorationInfo: outputProrationInfo(reviewProrationInfo),
    showProrationButton: reviewProrationInfo?.length > 0,
    serviceTotal: getServicesTotal(serviceItemsWithCurrentPrices),
    lineItemsTotal: getLineItemsTotal(serviceItemsWithCurrentPrices),
    subscriptionOrdersTotal: getSubscriptionOrdersTotal(serviceItemsWithCurrentPrices),
    summaryForFirstBillingPeriod,
    summaryForSecondBillingPeriod: getProratedTotalForBillingPeriod(secondBillingPeriod),
    taxesInfo,
    grandTotal,
    recurringGrandTotal,
    subscriptionSurcharges,
    totalSurcharge,
  };
};

export default getSubscriptionSummary;
