import sum from 'lodash/sum.js';

import getSurchargesCalculation from '../surcharges/getSurchargesCalculation.js';
import getTaxesCalculation from '../taxes/getTaxesCalculation.js';
import getServicesTotal from './getServicesTotal.js';
import getLineItemsTotal from './getLineItemsTotal.js';
import getThresholdsTotal from './getThresholdsTotal.js';
import getOrderTotalsWithSurcharges from './getOrderTotalsWithSurcharges.js';
import getSurchargesTotal from './getSurchargesTotal.js';

const getSummary = async (
  ctx,
  {
    orders,
    businessLineId,
    businessUnitId,
    customerId,
    jobSiteId,
    customerJobSiteId,
    applySurcharges,
    applyTaxes = true,
    ordersSurcharges = {},
  },
  {
    pricesRepo,
    surchargeRepo,
    taxDistrictCustomerJobSiteRepo,
    jobSiteRepo,
    tenantRepo,
    customerTaxExemptionsRepo,
  },
) => {
  const servicesTotal = getServicesTotal(orders);
  const lineItemsTotal = getLineItemsTotal(orders);
  const thresholdsTotal = getThresholdsTotal(orders);
  const billableItemsTotal = sum([lineItemsTotal, thresholdsTotal]);
  const total = sum([servicesTotal, billableItemsTotal]);
  let surcharges = null;
  if (applySurcharges) {
    surcharges = await getSurchargesCalculation(
      ctx,
      {
        orders,
        businessLineId,
        businessUnitId,
        ordersSurcharges, // dirty temp fast solution to not duplicate requesting surcharges and getting prices for them
      },
      { pricesRepo, surchargeRepo },
    );
  }
  ctx.logger.debug(`getSummary->surcharges: ${JSON.stringify(surcharges, null, 2)}`);
  const surchargesTotal = getSurchargesTotal(orders, surcharges);
  ctx.logger.debug(`getSummary->surchargesTotal: ${JSON.stringify(surchargesTotal, null, 2)}`);
  const orderTotalsWithSurcharges = getOrderTotalsWithSurcharges(orders, surcharges);
  ctx.logger.debug(
    `getSummary->orderTotalsWithSurcharges: ${JSON.stringify(orderTotalsWithSurcharges, null, 2)}`,
  );
  const taxCalculation = applyTaxes
    ? await getTaxesCalculation(
        ctx,
        {
          orders: orderTotalsWithSurcharges,
          customerId,
          jobSiteId,
          customerJobSiteId,
          businessLineId,
        },
        {
          taxDistrictCustomerJobSiteRepo,
          jobSiteRepo,
          tenantRepo,
          customerTaxExemptionsRepo,
        },
      )
    : null;
  const { taxDistrictValues: taxes = null, taxesTotal = 0 } = taxCalculation ?? {};
  const grandTotal = sum([total, surchargesTotal, taxesTotal]);

  return {
    servicesTotal,
    lineItemsTotal,
    thresholdsTotal,
    billableItemsTotal,
    total,
    surchargesTotal,
    taxesTotal,
    grandTotal,
    calculations: {
      surcharges,
      taxes,
    },
  };
};

export default getSummary;
