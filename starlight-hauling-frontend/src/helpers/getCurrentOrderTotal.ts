import { Regions } from '@root/i18n/config/region';
import { type IConfigurableOrder, type ISurcharge, type ITaxDistrict } from '@root/types';

import { calcPrice } from './calcPrice';
import { calcOrderSurcharges } from './calcSurcharges';
import { calcOrderTaxes } from './calcTaxes';
import { isPartialTaxDistrict } from './isPartialTaxDistrict';

interface IGetCurrentOrderTotalInput {
  values: IConfigurableOrder;
  region: Regions;
  commercialTaxesUsed: boolean;
  surcharges?: ISurcharge[];
}

export const getCurrentOrderTotal = ({
  values,
  region,
  commercialTaxesUsed,
  surcharges,
}: IGetCurrentOrderTotalInput) => {
  // TODO: fix IConfigurableOrder types; some fields marked as `number` are at least `number | undefined`
  const serviceFee = parseFloat(values.billableServicePrice.toString());
  const lineItemsPrice = calcPrice(values.lineItems ?? []);
  const thresholdsPrice = calcPrice(values.thresholds);

  const billableItemsPrice = lineItemsPrice + thresholdsPrice;

  const beforeTaxesTotal = billableItemsPrice + serviceFee;

  let orderSurchargesTotal = 0;
  let lineItemsWithSurcharges = values.lineItems ?? [];
  let thresholdsWithSurcharges = values.thresholds;
  let serviceTotalWithSurcharges = serviceFee;

  if (values.applySurcharges) {
    ({
      orderSurchargesTotal,
      lineItemsWithSurcharges,
      serviceTotalWithSurcharges,
      thresholdsWithSurcharges,
    } = calcOrderSurcharges({ order: values, surcharges }));
  }

  const areTaxDistrictsPartial = values.taxDistricts?.some(isPartialTaxDistrict) ?? false;
  const taxesTotal =
    values.taxDistricts &&
    !areTaxDistrictsPartial &&
    (values.status !== 'canceled' || beforeTaxesTotal + orderSurchargesTotal !== 0) &&
    ((values.billableService && values.materialId) || values.lineItems?.length)
      ? calcOrderTaxes({
          taxDistricts: values.taxDistricts as ITaxDistrict[],
          serviceTotal: serviceTotalWithSurcharges,
          thresholds: thresholdsWithSurcharges,
          lineItems: lineItemsWithSurcharges,
          service: {
            materialId: values.materialId ?? undefined,
            billableServiceId: values.billableService?.originalId,
          },
          workOrder: values.workOrder,
          businessLineId: values.businessLine.id,
          region,
          commercialTaxesUsed,
        })
      : 0;
  const newOrderTotal = beforeTaxesTotal + orderSurchargesTotal + taxesTotal;

  return {
    serviceFee,
    billableItemsPrice,
    areTaxDistrictsPartial,
    taxesTotal,
    surchargesTotal: orderSurchargesTotal,
    newOrderTotal,
  };
};
