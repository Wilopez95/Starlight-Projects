import { isEmpty } from 'lodash-es';

import { calcNewOrderSurcharges, calcPrice, calcTaxesForOrderService } from '@root/helpers';
import { mathRound2 } from '@root/helpers/rounding';
import { Regions } from '@root/i18n/config/region';
import { ISurcharge, ITaxDistrict } from '@root/types';

import { INewOrderFormData } from '../types';

interface IGetTotalsInput {
  businessLineId: string;
  region: Regions;
  commercialTaxesUsed: boolean;
  taxDistricts?: ITaxDistrict[];
  surcharges?: ISurcharge[];
}

interface IGetOrderTotalInput extends IGetTotalsInput {
  order: INewOrderFormData;
}

interface IGetOrdersTotalInput extends IGetTotalsInput {
  orders: INewOrderFormData[];
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
        serviceTotal: serviceTotalWithSurcharges,
        lineItems: lineItemsWithSurcharges,
        region,
        thresholds: [],
        taxDistricts,
        businessLineId,
        commercialTaxesUsed,
      })
    : 0;

  const roundedTotal = mathRound2(
    lineItemsTotal + servicesTotal + orderSurchargesTotal + taxesTotal,
  );

  return roundedTotal * order.billableServiceQuantity;
};

export const getOrdersTotal = ({
  orders,
  businessLineId,
  region,
  taxDistricts,
  surcharges,
  commercialTaxesUsed,
}: IGetOrdersTotalInput) => {
  const total = orders.reduce(
    (acc, order) =>
      acc +
      getOrderTotal({
        order,
        businessLineId,
        region,
        taxDistricts,
        surcharges,
        commercialTaxesUsed,
      }),
    0,
  );
  const roundedTotal = mathRound2(total);

  return roundedTotal;
};
