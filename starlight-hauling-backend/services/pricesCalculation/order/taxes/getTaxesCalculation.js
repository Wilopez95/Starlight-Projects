import sum from 'lodash/sum.js';
import cloneDeep from 'lodash/cloneDeep.js';

import { calculateTaxes } from '../../../v2/orderTaxation.js';

const getTaxesCalculation = async (
  ctx,
  { orders, customerId, jobSiteId, customerJobSiteId, businessLineId },
  { taxDistrictCustomerJobSiteRepo, jobSiteRepo, tenantRepo, customerTaxExemptionsRepo },
  trx,
) => {
  const [customerJobSiteTaxDistricts, { region }] = await Promise.all([
    customerJobSiteId
      ? taxDistrictCustomerJobSiteRepo
          .getInstance(ctx.state)
          .getTaxDistrictsByPairId(customerJobSiteId, trx)
      : jobSiteRepo.getInstance(ctx.state).getDefaultTaxDistricts(
          {
            activeOnly: true,
            jobSiteId,
          },
          trx,
        ),
    tenantRepo.getInstance(ctx.state).getBy(
      {
        condition: { name: ctx.state.user.tenantName },
        fields: ['region'],
      },
      trx,
    ),
  ]);

  const exemptedTaxDistricts = await customerTaxExemptionsRepo
    .getInstance(ctx.state)
    .getExemptedDistricts(
      {
        customerId,
        customerJobSiteId,
        taxDistrictIds: customerJobSiteTaxDistricts.map(({ id }) => id),
      },
      trx,
    );

  const taxDistricts = customerJobSiteTaxDistricts.filter(
    ({ id }) => !exemptedTaxDistricts.includes(id),
  );

  const calculations = orders.map(
    ({
      taxDistricts: existingOrderTaxDistricts,
      orderId,
      billableServiceId,
      materialId,
      totalWithSurcharges,
      lineItems,
      thresholds,
      quantity,
      includingSurcharges,
      workOrder,
      commercialTaxesUsed,
    }) => {
      const taxableLineItems = cloneDeep(lineItems)?.map(lineItem => {
        lineItem.id = lineItem.lineItemId ?? null;
        return lineItem;
      });

      const taxableThresholds = cloneDeep(thresholds)?.map(threshold => {
        threshold.id = threshold.thresholdItemId ?? null;
        return threshold;
      });

      return calculateTaxes({
        taxDistricts: orderId ? existingOrderTaxDistricts : taxDistricts,
        commercial: !(commercialTaxesUsed === false),
        serviceTotal: Math.trunc(totalWithSurcharges / quantity),
        includeServiceTax: !!billableServiceId && totalWithSurcharges > 0,
        lineItems: taxableLineItems,
        thresholds: taxableThresholds,
        businessLineId,
        region,
        billableServiceId,
        materialId,
        includingSurcharges,
        workOrder,
      });
    },
  );

  return {
    taxesTotal: sum(calculations.map(({ taxesTotal }) => taxesTotal)),
    taxDistrictValues: calculations.map(({ taxDistrictValues }) => taxDistrictValues),
  };
};

export default getTaxesCalculation;
