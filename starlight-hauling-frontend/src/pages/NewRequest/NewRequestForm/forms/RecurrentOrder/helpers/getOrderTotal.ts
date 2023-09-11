import { isEmpty } from 'lodash-es';

import { calcNewOrderSurcharges, calcPrice, calcTaxesForOrderService } from '@root/helpers';
import { mathRound2 } from '@root/helpers/rounding';
import { Regions } from '@root/i18n/config/region';
import { ISurcharge, ITaxDistrict } from '@root/types';

import { INewOrderFormData } from '../../Order/types';
import { INewRecurrentOrderFormData } from '../types';

interface IGetOrderTotalInput {
  order: INewRecurrentOrderFormData | INewOrderFormData;
  businessLineId: string;
  region: Regions;
  commercialTaxesUsed: boolean;
  taxDistricts?: ITaxDistrict[];
  surcharges?: ISurcharge[];
}

export const getOrderTotal = ({
  order,
  businessLineId,
  region,
  taxDistricts,
  surcharges,
  commercialTaxesUsed,
}: IGetOrderTotalInput) => {
  const servicesTotal = Number(order.billableServicePrice) || 0;
  const lineItemsTotal = calcPrice(order.lineItems);

  let orderSurchargesTotal = 0;
  let lineItemsWithSurcharges = order.lineItems;
  let serviceTotalWithSurcharges = servicesTotal;

  if (!isEmpty(surcharges) && order.applySurcharges) {
    ({ orderSurchargesTotal, lineItemsWithSurcharges, serviceTotalWithSurcharges } =
      calcNewOrderSurcharges({ newOrder: order, surcharges: surcharges ?? [] }));
  }

  const taxesTotal = taxDistricts
    ? calcTaxesForOrderService(order, {
        region,
        serviceTotal: serviceTotalWithSurcharges,
        lineItems: lineItemsWithSurcharges,
        thresholds: [],
        taxDistricts,
        businessLineId,
        commercialTaxesUsed,
      })
    : 0;

  return (
    mathRound2(lineItemsTotal + servicesTotal + orderSurchargesTotal + taxesTotal) *
    (order.billableServiceQuantity ?? 1)
  );
};
