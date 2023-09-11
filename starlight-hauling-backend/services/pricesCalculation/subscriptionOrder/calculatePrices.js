import merge from 'lodash/merge.js';
import roundPrices from '../common/roundPrices.js';
import SubscriptionOrderLineItemRepo from '../../../repos/subscriptionOrderLineItem.js';
import CustomRatesGroupLineItemRepo from '../../../repos/customRatesGroupLineItem.js';
import GlobalRatesLineItemRepo from '../../../repos/globalRatesLineItem.js';
import SubscriptionOrdersRepo from '../../../repos/subscriptionOrder/subscriptionOrder.js';
import GlobalRatesServiceRepo from '../../../repos/globalRatesService.js';
import CustomRatesGroupServiceRepo from '../../../repos/customRatesGroupService.js';
import JobSiteRepo from '../../../repos/jobSite.js';
import CustomerRepo from '../../../repos/customer.js';
import SubsriptionSurchargeRepo from '../../../repos/subscriptionSurcharge.js';
import BillableServiceRepo from '../../../repos/billableService.js';
import BillableSurchargeRepo from '../../../repos/billableSurcharge.js';
import getSubscriptionOrderSummary from './summary/getSubscriptionOrderSummary.js';
import getPrices from './prices/getPrices.js';

const repos = {
  SubscriptionOrdersRepo,
  GlobalRatesServiceRepo,
  CustomRatesGroupServiceRepo,
  JobSiteRepo,
  CustomerRepo,
  SubscriptionOrderLineItemRepo,
  CustomRatesGroupLineItemRepo,
  GlobalRatesLineItemRepo,
  SubsriptionSurchargeRepo,
  BillableServiceRepo,
  BillableSurchargeRepo,
};

const calculatePrices = async (
  ctx,
  {
    businessUnitId,
    businessLineId,
    serviceDate,
    customRatesGroupId,
    subscriptionOrder,
    jobSiteId,
    customerId,
    serviceItemBillableServiceId = null,
    needRecalculateSurcharge,
    forceInput = true,
  },
  dependencies = repos,
) => {
  const result = {
    prices: {},
    summary: {},
  };

  result.prices = await getPrices(
    ctx,
    {
      businessUnitId,
      businessLineId,
      serviceDate,
      customRatesGroupId,
      subscriptionOrder,
      serviceItemBillableServiceId,
      forceInput,
    },
    dependencies,
  );

  result.summary = await getSubscriptionOrderSummary(
    ctx,
    {
      subscriptionOrderWithCurrentPrices: merge(subscriptionOrder, result.prices),
      businessLineId,
      businessUnitId,
      customRatesGroupId,
      needRecalculateSurcharge,
      jobSiteId,
      customerId,
    },
    dependencies,
  );

  return roundPrices(result);
};

export default calculatePrices;
