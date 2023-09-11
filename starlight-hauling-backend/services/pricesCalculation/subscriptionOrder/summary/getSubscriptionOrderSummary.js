import merge from 'lodash/merge.js';

import calculateTotalPrices from '../prices/calculateTotalPrices.js';
import { getLineItemsTotal, getSubscriptionOrdersTotal } from '../common/getTotals.js';
import { getGrandTotal } from '../../common/getTotals.js';
import getSurchargesInfo from '../surcharges/getSurchagesInfo.js';
import getTaxesInfo from '../taxes/getTaxesInfo.js';

const getSubscriptionOrderSummary = async (
  ctx,
  {
    subscriptionOrderWithCurrentPrices,
    needRecalculateSurcharge,
    businessLineId,
    businessUnitId,
    customRatesGroupId,
    jobSiteId,
    customerId,
  },
  dependencies,
) => {
  const subscriptionOrderWithTotalPrices = calculateTotalPrices(subscriptionOrderWithCurrentPrices);

  const { surchargeTotals, orderSurcharges } = await getSurchargesInfo(
    ctx,
    {
      businessLineId,
      businessUnitId,
      customRatesGroupId,
      subscriptionOrder: subscriptionOrderWithTotalPrices,
      needRecalculateSurcharge,
    },
    dependencies,
  );

  if (surchargeTotals.totalSurchargePrice) {
    merge(subscriptionOrderWithTotalPrices, surchargeTotals);
  }

  const taxesInfo = await getTaxesInfo(
    ctx,
    {
      subscriptionOrder: subscriptionOrderWithTotalPrices,
      jobSiteId,
      businessLineId,
      customerId,
    },
    dependencies,
  );

  const subscriptionOrdersTotal = getSubscriptionOrdersTotal([subscriptionOrderWithCurrentPrices]);
  const lineItemsTotal = getLineItemsTotal([subscriptionOrderWithCurrentPrices]);
  const total = getGrandTotal(subscriptionOrdersTotal, lineItemsTotal);
  const surchargesTotal = getGrandTotal(surchargeTotals.totalSurchargePrice);
  const grandTotal = getGrandTotal(total, taxesInfo.taxesTotal);

  return {
    orderSurcharges,
    subscriptionOrdersTotal,
    lineItemsTotal,
    surchargesTotal,
    total,
    taxesInfo,
    grandTotal,
  };
};

export default getSubscriptionOrderSummary;
