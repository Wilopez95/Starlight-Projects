import merge from 'lodash/merge.js';

import BillableServiceInclusionRepo from '../../../repos/billableServiceInclusion.js';
import RecurringLineItemsGlobalRatesRepo from '../../../repos/globalRateRecurringLineItemBillingCycle.js';
import RecurringLineItemsCustomRatesRepo from '../../../repos/customRatesGroupRecurringLineItemBillingCycle.js';
import RecurringServicesGlobalRatesRepo from '../../../repos/globalRateRecurringServiceFrequency.js';
import RecurringServicesCustomRatesRepo from '../../../repos/customRatesGroupRecurringServiceFrequency.js';
import CustomRatesGroupServiceRepo from '../../../repos/customRatesGroupService.js';
import GlobalRatesRecurringServiceRepo from '../../../repos/globalRateRecurringService.js';
import GlobalRatesServiceRepo from '../../../repos/globalRatesService.js';
import CustomRatesSurchargeRepo from '../../../repos/customRatesGroupSurcharge.js';
import GlobalRatesSurchargeRepo from '../../../repos/globalRatesSurcharge.js';
import JobSiteRepo from '../../../repos/jobSite.js';
import BillableServiceRepo from '../../../repos/billableService.js';
import BillableSurchargeRepo from '../../../repos/billableSurcharge.js';
import CustomerRepo from '../../../repos/customer.js';
// pre-pricing service code:
// import roundPrices from '../common/roundPrices.js';
// import getPrices from './prices/getPrices.js';
// import getSubscriptionSummary from './summary/getSubscriptionSummary.js';
// import getBillableServiceInclusions from './common/getBillableServiceInclusions.js';
import BillableLineItemRepo from '../../../repos/billableLineItem.js';
import SubsriptionSurchargeRepo from '../../../repos/subscriptionSurcharge.js';
import roundPrices from '../common/roundPrices.js';
import getPrices from './prices/getPrices.js';
import getSubscriptionSummary from './summary/getSubscriptionSummary.js';

const repos = {
  BillableLineItemRepo,
  BillableServiceInclusionRepo,
  BillableServiceRepo,
  BillableSurchargeRepo,
  RecurringLineItemsGlobalRatesRepo,
  RecurringLineItemsCustomRatesRepo,
  RecurringServicesGlobalRatesRepo,
  RecurringServicesCustomRatesRepo,
  GlobalRatesRecurringServiceRepo,
  GlobalRatesServiceRepo,
  GlobalRatesSurchargeRepo,
  CustomRatesSurchargeRepo,
  CustomRatesGroupServiceRepo,
  JobSiteRepo,
  CustomerRepo,
  SubsriptionSurchargeRepo,
};

const calculatePrices = async (
  ctx,
  {
    businessUnitId,
    businessLineId,
    billingCycle,
    anniversaryBilling,
    includeInvoiced,
    startDate,
    endDate,
    customRatesGroupId,
    serviceItems,
    jobSiteId,
    forceInput = true,
    today = new Date(),
    needRecalculateSurcharge,
    applySurcharges,
    subscriptionId,
    customerId,
    billableServiceInclusions,
  },
  dependencies = repos,
) => {
  const result = {
    subscriptionPrices: {
      serviceItems: [],
    },
    subscriptionPriceCalculation: {},
  };
  // pre-pricing service code:
  // const billableServiceInclusions = await getBillableServiceInclusions(
  //   ctx,
  //   { serviceItems },
  //   dependencies,
  // );
  console.log('🚀 aa4 ~ file: calculatePrices.js:83 ~  ~ starting timer for getPrices:🚀');
  let start = Date.now();
  result.subscriptionPrices.serviceItems = await getPrices(
    ctx,
    {
      businessUnitId,
      businessLineId,
      billingCycle,
      startDate,
      customRatesGroupId,
      serviceItems,
      billableServiceInclusions,
      today,
      forceInput,
    },
    dependencies,
  );
  let timeTaken = Date.now() - start;
  console.log('🚀 aa4 ~ file: calculatePrices.js:103 ~  ~ getPrices:🚀', timeTaken);

  console.log('🚀 aa19 ~ file: calculatePrices.js:108 ~  ~ starting timer for serviceItems.map:🚀');
  start = Date.now();

  const serviceItemsForProration = await serviceItems.map((serviceItem, idx) => {
    if (serviceItem.subscriptionOrders) {
      merge(
        serviceItem.subscriptionOrders,
        result.subscriptionPrices.serviceItems[idx].subscriptionOrders,
      );
    }
    return serviceItem;
  });

  timeTaken = Date.now() - start;
  console.log('🚀 aa19 ~ file: calculatePrices.js:124 ~  ~ serviceItems.map:🚀', timeTaken);

  console.log(
    '🚀 aa20 ~ file: calculatePrices.js:129 ~  ~ starting timer for getSubscriptionSummary:🚀',
  );
  start = Date.now();

  result.subscriptionPriceCalculation = await getSubscriptionSummary(
    ctx,
    {
      serviceItems: serviceItemsForProration ? serviceItemsForProration : [],
      serviceItemsWithCurrentPrices: merge(serviceItems, result.subscriptionPrices.serviceItems),
      needRecalculateSurcharge,
      billableServiceInclusions,
      applySurcharges,
      subscriptionId,
      billingCycle,
      anniversaryBilling,
      includeInvoiced,
      startDate,
      endDate,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      jobSiteId,
      customerId,
      today,
    },
    dependencies,
  );
  timeTaken = Date.now() - start;
  console.log('🚀 aa20 ~ file: calculatePrices.js:158 ~  ~ getSubscriptionSummary:🚀', timeTaken);
  return roundPrices(result);
};

export default calculatePrices;
