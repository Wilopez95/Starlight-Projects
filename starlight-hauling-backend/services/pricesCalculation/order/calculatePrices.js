import merge from 'lodash/merge.js';
import omit from 'lodash/omit.js';

import baseRepository from '../../../repos/_base.js';
import pricesRepository from '../../../repos/prices.js';
import priceGroupsRepository from '../../../repos/priceGroups.js';
import orderRepository from '../../../repos/v2/order.js';
import surchargeRepository from '../../../repos/billableSurcharge.js';
import taxDistrictCustomerJobSiteRepository from '../../../repos/taxDistrictCustomerJobSite.js';
import jobSiteRepository from '../../../repos/jobSite.js';
import tenantRepository from '../../../repos/tenant.js';
import customerTaxExemptionsRepository from '../../../repos/customerTaxExemptions.js';

import getPrices from './prices/getPricesForOrders.js';
import getSummary from './summary/getSummary.js';

const calculatePrices = async (
  ctx,
  {
    businessUnitId,
    businessLineId,
    customerId,
    jobSiteId,
    customerJobSiteId,
    applySurcharges,
    applyTaxes,
    orders,
    ordersSurcharges = {},
  },
  {
    baseRepo = baseRepository,
    priceGroupsRepo = priceGroupsRepository,
    pricesRepo = pricesRepository,
    orderRepo = orderRepository,
    surchargeRepo = surchargeRepository,
    taxDistrictCustomerJobSiteRepo = taxDistrictCustomerJobSiteRepository,
    jobSiteRepo = jobSiteRepository,
    tenantRepo = tenantRepository,
    customerTaxExemptionsRepo = customerTaxExemptionsRepository,
  } = {},
) => {
  const result = {
    prices: [],
    summary: {},
  };

  const orderPrices = await getPrices(
    ctx,
    {
      businessUnitId,
      businessLineId,
      orders,
    },
    { baseRepo, priceGroupsRepo, pricesRepo, orderRepo },
  );
  ctx.logger.debug(`calculatePrices->orderPrices: ${JSON.stringify(orderPrices, null, 2)}`);

  result.prices = orderPrices.map(order =>
    omit(order, [
      'surcharges',
      'applySurcharges',
      'taxDistricts',
      'workOrder',
      'commercialTaxesUsed',
    ]),
  );

  result.summary = await getSummary(
    ctx,
    {
      orders: merge(orders, orderPrices),
      businessLineId,
      businessUnitId,
      customerId,
      jobSiteId,
      customerJobSiteId,
      applySurcharges,
      applyTaxes,
      ordersSurcharges, // dirty temp fast solution to not duplicate requesting surcharges and getting prices for them
    },
    {
      pricesRepo,
      orderRepo,
      surchargeRepo,
      taxDistrictCustomerJobSiteRepo,
      jobSiteRepo,
      tenantRepo,
      customerTaxExemptionsRepo,
    },
  );
  ctx.logger.debug(`calculatePrices->result: ${JSON.stringify(result, null, 2)}`);

  return result;
};

export default calculatePrices;
