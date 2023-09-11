import TaxDistrictCustomerJobSiteRepo from '../../../../repos/taxDistrictCustomerJobSite.js';
import JobSiteRepo from '../../../../repos/jobSite.js';
import TenantRepo from '../../../../repos/tenant.js';
import CustomerTaxExemptionsRepo from '../../../../repos/customerTaxExemptions.js';

import getOrderTotalsWithSurcharges from '../summary/getOrderTotalsWithSurcharges.js';
import getTaxesCalculation from './getTaxesCalculation.js';

const calculateTaxes = async (ctx, { order, surcharges }, trx) => {
  // ctx.logger.debug(`calculateTaxes->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(`calculateTaxes->surcharges: ${JSON.stringify(surcharges, null, 2)}`);

  const {
    customer: { originalId: customerId },
    jobSite: { originalId: jobSiteId },
    customerJobSite: { originalId: customerJobSiteId },
    businessLineId,
  } = order;

  const orderTotalsWithSurcharges = getOrderTotalsWithSurcharges([order], [surcharges]);
  // ctx.logger.debug(`calculateTaxes->orderTotalsWithSurcharges: ${JSON.stringify(orderTotalsWithSurcharges, null, 2)}`);
  try {
    const taxCalculation = await getTaxesCalculation(
      ctx,
      {
        orders: orderTotalsWithSurcharges,
        customerId,
        jobSiteId,
        customerJobSiteId,
        businessLineId,
      },
      {
        taxDistrictCustomerJobSiteRepo: TaxDistrictCustomerJobSiteRepo,
        jobSiteRepo: JobSiteRepo,
        tenantRepo: TenantRepo,
        customerTaxExemptionsRepo: CustomerTaxExemptionsRepo,
      },
      trx,
    );
    ctx.logger.debug(`calculateTaxes->taxCalculation: ${JSON.stringify(taxCalculation, null, 2)}`);
    const { taxDistrictValues: taxes = null, taxesTotal = 0 } = taxCalculation ?? {};

    return { taxes, taxesTotal };
  } catch (error) {
    ctx.logger.error(error, `Error while calculating taxes for an order with id ${order.id}`);
    throw error;
  }
};

export default calculateTaxes;
