/* eslint-disable no-unsafe-optional-chaining, @typescript-eslint/no-unused-expressions */
import { cloneDeep, uniqBy } from 'lodash-es';

import { SurchargeCalculation } from '@root/consts';
import { INewOrderFormData } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';
import { INewRecurrentOrderFormData } from '@root/pages/NewRequest/NewRequestForm/forms/RecurrentOrder/types';
import { Order } from '@root/stores/entities';
import {
  IConfigurableOrder,
  ICustomRateSurcharge,
  IEntity,
  IGlobalRateSurcharge,
  IOrderLineItem,
  IOrderThreshold,
  ISurcharge,
  VersionedEntity,
} from '@root/types';

import { mathRound2 } from './rounding';

export interface IBillableItemSurcharge {
  billableItemPrice: number;
  rateValue: number;
  total: number;
  billableLineItemId?: number;
  billableThresholdId?: number;
  billableServiceId?: number;
  materialId?: number | null;
  description?: string;
  applySurcharges?: boolean;
}

export interface IOrderViewSurcharge {
  id: number;
  calculation: SurchargeCalculation;
  description: string;
  billableItemSurcharges: IBillableItemSurcharge[];
  total: number;
  flatRateValue?: number;
  materialId?: number | null;
  materialBasedPricing?: boolean;
}

interface ISurchargeToCalc {
  id: number;
  calculation: SurchargeCalculation;
  description: string;
  materialBasedPricing?: boolean;
}

interface IOrderToCalc {
  lineItems: Omit<IOrderLineItem, keyof IEntity>[];
  billableServicePrice?: number;
  billableServiceApplySurcharges?: boolean;
  billableServiceId?: number;
  billableServiceDescription?: string;
  thresholds?: IOrderThreshold[];
  materialId?: number | null;
}

export const calcSurcharges = ({
  orderToCalc,
  surchargesToCalc,
  globalRatesSurcharges,
  customRatesSurcharges,
}: {
  orderToCalc: IOrderToCalc;
  globalRatesSurcharges: IGlobalRateSurcharge[];
  customRatesSurcharges: ICustomRateSurcharge[];
  surchargesToCalc: ISurchargeToCalc[];
}) => {
  const getRate = (surchargeId: number, materialId: number | null) => {
    const globalRate = globalRatesSurcharges.find(
      surchargeRate =>
        surchargeRate.surchargeId === surchargeId && surchargeRate.materialId === materialId,
    );
    const customRate = customRatesSurcharges.find(
      surchargeRate =>
        surchargeRate.surchargeId === surchargeId && surchargeRate.materialId === materialId,
    );
    return customRate ?? globalRate;
  };

  let serviceTotalWithSurcharges = orderToCalc.billableServicePrice ?? 0;
  let orderSurcharges: IOrderViewSurcharge[] = [];
  const lineItemsWithSurcharges = cloneDeep(orderToCalc.lineItems);
  const thresholdsWithSurcharges = orderToCalc.thresholds ? cloneDeep(orderToCalc.thresholds) : [];

  let lineItemsTotalWithSurcharges = orderToCalc.lineItems.reduce(
    (acc, lineItem) => acc + ((lineItem.price ?? 0) * lineItem.quantity || 0),
    0,
  );

  surchargesToCalc.forEach(surcharge => {
    const { materialId } = orderToCalc;
    const { billableServiceApplySurcharges } = orderToCalc;
    const billableServiceId = orderToCalc.billableServiceId;
    let rate;

    if (surcharge.materialBasedPricing && materialId) {
      rate = getRate(surcharge.id, materialId);
    } else if (!surcharge.materialBasedPricing) {
      rate = getRate(surcharge.id, null);
    }

    let total = 0;

    if (surcharge.calculation === SurchargeCalculation.Flat && rate) {
      total = rate.price ?? 0;
    }

    let billableItemSurcharges: IBillableItemSurcharge[] = [];

    if (surcharge.calculation === SurchargeCalculation.Percentage) {
      if (billableServiceId && billableServiceApplySurcharges && rate) {
        const serviceTotal = orderToCalc.billableServicePrice ?? 0;
        const surchargeTotal = mathRound2((serviceTotal * (rate.price ?? 0)) / 100);

        billableItemSurcharges = [
          {
            billableServiceId,
            description: orderToCalc.billableServiceDescription,
            materialId,
            billableItemPrice: serviceTotal,
            rateValue: rate.price ?? 0,
            total: surchargeTotal,
            applySurcharges: billableServiceApplySurcharges,
          },
        ];

        serviceTotalWithSurcharges = Number(serviceTotalWithSurcharges) + surchargeTotal;
      }

      orderToCalc.lineItems.forEach((lineItem, index) => {
        let lineItemRate;
        const lineItemMaterialId =
          lineItem.material?.originalId ?? lineItem.materialId ?? materialId ?? null;

        if (surcharge.materialBasedPricing && lineItemMaterialId) {
          lineItemRate = getRate(surcharge.id, lineItemMaterialId);
        } else if (!surcharge.materialBasedPricing) {
          lineItemRate = getRate(surcharge.id, null);
        }

        const lineItemTotal = (lineItem.price ?? 0) * lineItem.quantity;

        if (lineItem.applySurcharges && lineItemRate) {
          const surchargeTotal = mathRound2(
            ((lineItemTotal || 0) * (lineItemRate.price ?? 0)) / 100,
          );

          billableItemSurcharges = [
            ...billableItemSurcharges,
            {
              billableLineItemId: lineItem.billableLineItemId,
              materialId: lineItemMaterialId,
              description: lineItem.billableLineItem?.description,
              billableItemPrice: lineItemTotal,
              rateValue: lineItemRate.price ?? 0,
              total: surchargeTotal,
              applySurcharges: lineItem.applySurcharges,
            },
          ];

          lineItemsTotalWithSurcharges = Number(lineItemsTotalWithSurcharges) + surchargeTotal;

          if (lineItemsWithSurcharges[index].price) {
            const lineItemWithSurcharges = lineItemsWithSurcharges[index];

            if (lineItemWithSurcharges.price) {
              lineItemWithSurcharges.price =
                Number(lineItemWithSurcharges.price) +
                mathRound2(((lineItem.price ?? 0) * (lineItemRate.price ?? 0)) / 100);
            }
          }
        }
      });

      orderToCalc.thresholds?.forEach((threshold, index) => {
        if (surcharge.materialBasedPricing) {
          return;
        }

        const thresholdRate = getRate(surcharge.id, null);

        const thresholdTotal = mathRound2((threshold.price || 0) * (threshold.quantity || 0));

        if (threshold.applySurcharges && thresholdRate) {
          const surchargeTotal = mathRound2((thresholdTotal * (thresholdRate.price ?? 0)) / 100);

          billableItemSurcharges = [
            ...billableItemSurcharges,
            {
              billableThresholdId: threshold.thresholdId,
              billableItemPrice: thresholdTotal,
              rateValue: thresholdRate.price ?? 0,
              total: surchargeTotal,
              description: threshold.threshold.description,
            },
          ];

          if (thresholdsWithSurcharges[index].price) {
            thresholdsWithSurcharges[index].price =
              Number(thresholdsWithSurcharges[index].price) +
              mathRound2((threshold.price * (thresholdRate.price ?? 0)) / 100);
          }
        }
      });

      if (!billableItemSurcharges.length) {
        return null;
      }
    }

    if (surcharge.calculation === SurchargeCalculation.Percentage) {
      total = billableItemSurcharges.reduce((acc, item) => acc + item.total, 0);
    } else {
      serviceTotalWithSurcharges += total;
    }

    orderSurcharges = [
      ...orderSurcharges,
      {
        id: surcharge.id,
        calculation: surcharge.calculation,
        description: surcharge.description,
        flatRateValue:
          surcharge.calculation === SurchargeCalculation.Flat ? rate?.price ?? 0 : undefined,
        materialId: orderToCalc.materialId,
        materialBasedPricing: surcharge.materialBasedPricing,
        billableItemSurcharges,
        total,
      },
    ];
  });

  const orderSurchargesTotal = orderSurcharges.reduce((acc, surcharge) => acc + surcharge.total, 0);

  return {
    orderSurchargesTotal,
    orderSurcharges,
    serviceTotalWithSurcharges,
    lineItemsTotalWithSurcharges,
    lineItemsWithSurcharges,
    thresholdsWithSurcharges,
  };
};

export const calcOrderSurcharges = ({
  order,
  surcharges,
}: {
  order: IConfigurableOrder;
  surcharges?: ISurcharge[];
}) => {
  const addedCustomRates: VersionedEntity<ICustomRateSurcharge>[] = [];
  const addedGlobalRates: VersionedEntity<IGlobalRateSurcharge>[] = [];
  const addedSurcharges: VersionedEntity<ISurcharge>[] = [];

  let surchargesToCalc: ISurchargeToCalc[];

  if (order.surcharges) {
    order.surcharges.forEach(({ customRatesGroupSurcharge, globalRatesSurcharge, surcharge }) => {
      customRatesGroupSurcharge && addedCustomRates.push(customRatesGroupSurcharge);
      globalRatesSurcharge && addedGlobalRates.push(globalRatesSurcharge);
      addedSurcharges.push(surcharge);
    });

    surchargesToCalc = uniqBy(addedSurcharges, 'originalId').map(surcharge => ({
      id: surcharge.originalId,
      materialBasedPricing: surcharge.materialBasedPricing,
      calculation: surcharge.calculation,
      description: surcharge.description,
    }));
  } else {
    const activeSurcharges = surcharges?.filter(({ active }) => active) ?? [];
    surchargesToCalc = activeSurcharges.map(surcharge => ({
      id: surcharge.id,
      calculation: surcharge.calculation,
      description: surcharge.description,
      materialBasedPricing: surcharge.materialBasedPricing,
    }));
  }
  let globalRatesSurcharges: IGlobalRateSurcharge[] = [];
  if (order.globalRatesSurcharges) {
    globalRatesSurcharges = uniqBy(addedGlobalRates, 'id').concat(
      order.globalRatesSurcharges as VersionedEntity<IGlobalRateSurcharge>[],
    );
  } else {
    globalRatesSurcharges = uniqBy(addedGlobalRates, 'id');
  }

  let customRatesSurcharges: ICustomRateSurcharge[] = [];
  if (order.customRatesSurcharges) {
    customRatesSurcharges = uniqBy(addedCustomRates, 'id').concat(
      order.customRatesSurcharges as VersionedEntity<ICustomRateSurcharge>[],
    );
  } else {
    customRatesSurcharges = uniqBy(addedCustomRates, 'id');
  }

  const orderToCalc: IOrderToCalc = {
    materialId: order.materialId ?? null,
    billableServiceApplySurcharges: order.billableServiceApplySurcharges,
    billableServiceId: order.billableService?.originalId,
    billableServiceDescription: order.billableService?.description,
    billableServicePrice: order.billableServicePrice
      ? Number(order.billableServicePrice)
      : undefined,
    thresholds: order.thresholds,
    lineItems: order.lineItems ?? [],
  };
  const mappedSurcharges = calcSurcharges({
    surchargesToCalc,
    orderToCalc,
    globalRatesSurcharges,
    customRatesSurcharges,
  });

  return mappedSurcharges;
};

export const calcDetailsOrderSurcharges = ({ order }: { order: Order }) => {
  const addedCustomRates: VersionedEntity<ICustomRateSurcharge>[] = [];
  const addedGlobalRates: VersionedEntity<IGlobalRateSurcharge>[] = [];
  const addedSurcharges: VersionedEntity<ISurcharge>[] = [];

  order.surcharges?.forEach(({ customRatesGroupSurcharge, globalRatesSurcharge, surcharge }) => {
    customRatesGroupSurcharge && addedCustomRates.push(customRatesGroupSurcharge);
    globalRatesSurcharge && addedGlobalRates.push(globalRatesSurcharge);
    addedSurcharges.push(surcharge);
  });

  const surchargesToCalc: ISurchargeToCalc[] = uniqBy(addedSurcharges, 'originalId').map(
    surcharge => ({
      id: surcharge.originalId,
      calculation: surcharge.calculation,
      description: surcharge.description,
      materialBasedPricing: surcharge.materialBasedPricing,
    }),
  );

  const orderToCalc: IOrderToCalc = {
    materialId: order.material?.originalId ?? null,
    billableServiceApplySurcharges: order.billableService?.applySurcharges,
    billableServiceId: order.billableService?.originalId,
    billableServiceDescription: order.billableService?.description,
    billableServicePrice: order.billableServicePrice
      ? Number(order.billableServicePrice)
      : undefined,
    thresholds: order.thresholds ?? [],
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    lineItems: order.lineItems ?? [],
  };

  const mappedSurcharges = calcSurcharges({
    surchargesToCalc,
    orderToCalc,
    globalRatesSurcharges: uniqBy(addedGlobalRates, 'id'),
    customRatesSurcharges: uniqBy(addedCustomRates, 'id'),
  });

  return mappedSurcharges;
};

export const calcNewOrderSurcharges = ({
  newOrder,
  surcharges,
}: {
  newOrder: INewOrderFormData | INewRecurrentOrderFormData | INewOrderFormData;
  surcharges?: ISurcharge[];
}) => {
  const activeSurcharges = surcharges?.filter(({ active }) => active) ?? [];

  const globalRatesSurcharges = newOrder.globalRatesSurcharges ?? [];
  const customRatesSurcharges = newOrder.customRatesSurcharges ?? [];

  const surchargesToCalc: ISurchargeToCalc[] = activeSurcharges.map(surcharge => ({
    id: surcharge.id,
    calculation: surcharge.calculation,
    description: surcharge.description,
    materialBasedPricing: surcharge.materialBasedPricing,
  }));

  const orderToCalc: IOrderToCalc = {
    materialId: newOrder.materialId ?? null,
    billableServiceApplySurcharges: newOrder.billableServiceApplySurcharges,
    billableServiceId: newOrder.billableServiceId,
    billableServicePrice: newOrder.billableServicePrice
      ? Number(newOrder.billableServicePrice)
      : undefined,
    thresholds: [],
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    lineItems: newOrder.lineItems ?? [],
  };

  const mappedSurcharges = calcSurcharges({
    surchargesToCalc,
    orderToCalc,
    globalRatesSurcharges,
    customRatesSurcharges,
  });

  return mappedSurcharges;
};
