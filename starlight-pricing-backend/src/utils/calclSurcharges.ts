import { cloneDeep } from 'lodash';
import { CustomRatesGroupSurcharges } from '../database/entities/tenant/CustomRatesGroupSurcharges';
import { Context } from '../Interfaces/Auth';
import { IBillableSurcharge } from '../Interfaces/BillableSurcharge';
import { IGeneralData } from '../Interfaces/GeneralData';
import { IGlobalRateSurcharge } from '../Interfaces/GlobalRateSurcharge';
import { IOrderSurcharge, IOrderSurchargeHistorical } from '../Interfaces/OrderSurcharge';
import { ICalcRates, ICalcRatesResponse, ICalculateSurcharges } from '../Interfaces/SurchargeItem';
import {
  getOrderData,
  getGlobalRatesServices,
  getGlobalRatesSurcharges,
  getCustomGroupRatesSurcharges,
} from '../request/haulingRequest';
import { mathRound2 } from './math';

const getRateMaterialId = (surcharge: IBillableSurcharge, materialId?: number | null) => {
  if (surcharge.materialBasedPricing && materialId) {
    return materialId;
  }
  return null;
};

export const calcRates = async ({
  ctx,
  businessUnitId,
  businessLineId,
  customRatesGroupId,
  type,
  billableServiceId = null,
  equipmentItemId = null,
  materialId = null,
  // billableLineItems: unknown = [],
  // recurringLineItemIds: unknown = [],
  //billingCycle: any = null,
  // billableServiceIds: number[] = [],
  applySurcharges = true,
}: ICalcRates): Promise<ICalcRatesResponse> => {
  // const billableService = { billableServiceId, equipmentItemId, materialId };
  let globalRatesService;
  if (billableServiceId) {
    globalRatesService = await getGlobalRatesServices(ctx, {
      data: {
        businessUnitId,
        businessLineId,
        billableServiceId,
        equipmentItemId,
        materialId,
      },
    });
    //ToDo:<Implements get from global_rates_services from core>
    //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
  }

  let globalRatesLineItems;
  // if (billableLineItems?.length) {
  //   //ToDo:<Implements get from global_rates_line_items from core>
  //   //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
  // }

  let globalRatesServiceItems;
  // if (billableServiceIds?.length) {
  //   //ToDo:<Implements get from global_rates_line_items from core>
  //   //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
  // }

  let globalRatesSurcharges;
  if (applySurcharges) {
    try {
      globalRatesSurcharges = await getGlobalRatesSurcharges(ctx, {
        data: { businessUnitId, businessLineId },
      });
    } catch (error: unknown) {
      ctx.logger.error(error);
    }
  }

  let globalRecurringLineItems;
  // if (recurringLineItemIds?.length) {
  //   //ToDo:<Implements get from global_rates_recurring_line_items from core>
  //   //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
  // }

  const globalRates = {
    globalRatesService,
    globalRatesLineItems,
    globalRatesServiceItems,
    globalRecurringLineItems,
    globalRatesSurcharges,
  };

  if (type === 'global') {
    return { globalRates };
  }

  let customRatesService;
  // if (billableServiceId) {
  //   //ToDo:<Implements get from custom_rates_group_services from core>
  //   //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
  // }

  let customRatesLineItems;
  // if (billableLineItems?.length) {
  //   //ToDo:<Implements get from custom_rates_group_line_items from core>
  //   //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
  // }

  let customRatesSurcharges;
  if (applySurcharges) {
    try {
      customRatesSurcharges = await getCustomGroupRatesSurcharges(ctx, {
        data: { businessUnitId, businessLineId, customRatesGroupId },
      });
    } catch (error: unknown) {
      ctx.logger.error(error);
    }
  }

  let customRecurringLineItems;
  // if (recurringLineItemIds?.length) {
  //   //ToDo:<Implements get from custom_rates_group_line_items from core>
  //   //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
  // }

  let customRatesServiceItems;
  // if (billableServiceIds?.length) {
  //   //ToDo:<Implements get from custom_rates_group_services from core>
  //   //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
  // }

  const customRates = {
    customRatesService,
    customRatesLineItems,
    customRatesServiceItems,
    customRecurringLineItems,
    customRatesSurcharges,
  };

  const response = { customRates, globalRates };
  return response;
};

export const calculateSurcharges = ({
  globalRatesSurcharges = [],
  customRatesSurcharges = [],
  materialId,
  billableServiceId,
  billableServicePrice,
  billableServiceApplySurcharges,
  lineItems = [],
  surcharges = [],
  serviceQuantity = 1,
}: ICalculateSurcharges) => {
  const getGlobalRate = (surchargeId, rateMaterialId) =>
    globalRatesSurcharges.find(
      surchargeRate =>
        surchargeRate.surchargeId === surchargeId && surchargeRate.materialId === rateMaterialId,
    );

  const getCustomRate = (surchargeId: number, rateMaterialId: number | null) =>
    customRatesSurcharges.find(
      surchargeRate =>
        surchargeRate.surchargeId === surchargeId && surchargeRate.materialId === rateMaterialId,
    );

  const getRate = (surchargeId: number, rateMaterialId: number | null) =>
    getCustomRate(surchargeId, rateMaterialId) ?? getGlobalRate(surchargeId, rateMaterialId);

  let serviceTotalWithSurcharges = Number(billableServicePrice) || 0;
  let orderSurchargesTotal = 0;
  const lineItemsWithSurcharges = cloneDeep(lineItems);
  //Pending thresholds

  const orderSurcharges: IOrderSurcharge[] = [];
  surcharges.forEach((surcharge: IBillableSurcharge) => {
    let rate: IGlobalRateSurcharge | CustomRatesGroupSurcharges | undefined;
    if (surcharge.materialBasedPricing && materialId) {
      rate = getRate(surcharge.id, materialId);
    } else if (!surcharge.materialBasedPricing) {
      rate = getRate(surcharge.id, null);
    }
    if (surcharge.calculation === 'flat' && rate) {
      orderSurchargesTotal = mathRound2(orderSurchargesTotal + (rate.price ?? 0));

      serviceTotalWithSurcharges = mathRound2(serviceTotalWithSurcharges + (rate.price ?? 0));
      const rateMaterialId = getRateMaterialId(surcharge, materialId);
      orderSurcharges.push({
        surchargeId: surcharge.id,
        materialId,
        globalRatesSurchargesId: getGlobalRate(
          surcharge.id,
          surcharge.materialBasedPricing ? materialId : null,
        )?.id,
        customRatesGroupSurchargesId: getCustomRate(surcharge.id, rateMaterialId)?.id ?? null,
        amount: rate.price,
        quantity: serviceQuantity,
      });
    }

    if (surcharge.calculation === 'percentage') {
      if (billableServiceApplySurcharges && rate && billableServicePrice) {
        const surchargeValue = mathRound2((billableServicePrice * (rate.price ?? 0)) / 100);
        orderSurchargesTotal = mathRound2(orderSurchargesTotal + surchargeValue);
        serviceTotalWithSurcharges = mathRound2(serviceTotalWithSurcharges + surchargeValue);

        const rateMaterialId = getRateMaterialId(surcharge, materialId);
        orderSurcharges.push({
          materialId,
          billableServiceId,
          surchargeId: surcharge.id,
          globalRatesSurchargesId: getGlobalRate(
            surcharge.id,
            surcharge.materialBasedPricing ? materialId : null,
          )?.id,
          customRatesGroupSurchargesId: getCustomRate(surcharge.id, rateMaterialId)?.id ?? null,
          amount: surchargeValue,
          quantity: serviceQuantity,
        });
      }

      lineItems.forEach((lineItem, index) => {
        let lineItemRate: IGlobalRateSurcharge | CustomRatesGroupSurcharges | undefined;
        const lineItemMaterialId: number | null = lineItem.materialId ?? materialId ?? null;
        if (surcharge.materialBasedPricing && lineItemMaterialId) {
          lineItemRate = getRate(surcharge.id, lineItemMaterialId);
        } else if (!surcharge.materialBasedPricing) {
          lineItemRate = getRate(surcharge.id, null);
        }
        const lineItemPrice = lineItem.price ?? 0;
        const lineItemTotal = lineItemPrice * lineItem.quantity;
        if (lineItem.applySurcharges && lineItemRate) {
          const surchargeValue = mathRound2((lineItemTotal * (lineItemRate.price ?? 0)) / 100);
          orderSurchargesTotal = mathRound2(orderSurchargesTotal + surchargeValue);
          const roundLineRate = mathRound2((lineItemPrice * (lineItemRate.price ?? 0)) / 100);
          lineItemsWithSurcharges[index].price = mathRound2(
            (lineItemsWithSurcharges[index].price ?? 0) + roundLineRate,
          );

          const rateMaterialId = getRateMaterialId(surcharge, lineItemMaterialId);

          orderSurcharges.push({
            materialId: lineItemMaterialId,
            surchargeId: surcharge.id,
            billableLineItemId: lineItem.billableLineItemId,
            globalRatesSurchargesId: getGlobalRate(
              surcharge.id,
              surcharge.materialBasedPricing ? lineItemMaterialId : null,
            )?.id,
            customRatesGroupSurchargesId: getCustomRate(surcharge.id, rateMaterialId)?.id ?? null,
            amount: surchargeValue,
            quantity: lineItem.quantity,
          });
        }
      });
      // if (!surcharge.materialBasedPricing) {
      //ToDo:<Investigate the implementation of thressholds>
      //By:<wlopez95> || Date: 31/08/2022 || TicketRelated : PS-271
      // }
    }
  });
  const response = {
    surchargesTotal: orderSurchargesTotal ? mathRound2(orderSurchargesTotal) : 0,
    serviceTotalWithSurcharges,
    lineItemsWithSurcharges,
    orderSurcharges,
  };

  return response;
};

export const getOrderSurchargeHistoricalIds = async (
  ctx: Context,
  OrderSurcharge: IOrderSurcharge[],
  orderId: number,
) => {
  const OrderSurchargeHistorical: IOrderSurchargeHistorical[] = [];

  for (let i = 0; i < OrderSurcharge.length; i++) {
    const requestResponse: IGeneralData = await getOrderData(ctx, {
      data: {
        materialId_Histo: OrderSurcharge[i].materialId,
        billableServiceId_Histo: OrderSurcharge[i].billableServiceId,
        surchargeId_Histo: OrderSurcharge[i].surchargeId,
        billableLineItemIdHisto: OrderSurcharge[i].billableLineItemId,
        globalRatesSurchargesId_Histo: OrderSurcharge[i].globalRatesSurchargesId,
        customRatesGroupSurchargesId_Histo: OrderSurcharge[i].customRatesGroupSurchargesId,
      },
    });
    OrderSurchargeHistorical.push({
      materialId: requestResponse.material?.id,
      billableServiceId: requestResponse.billableService
        ? requestResponse.billableService.id
        : null,
      surchargeId: requestResponse.surcharge?.id,
      billableLineItemId: requestResponse.billableLineItem
        ? requestResponse.billableLineItem.id
        : null,
      globalRatesSurchargesId: requestResponse.globalRatesSurcharge
        ? requestResponse.globalRatesSurcharge.id
        : null,
      customRatesGroupSurchargesId: requestResponse.customRatesGroupSurcharge
        ? requestResponse.customRatesGroupSurcharge.id
        : null,
      amount: OrderSurcharge[i].amount,
      quantity: OrderSurcharge[i].quantity,
      orderId,
    });
  }
  return OrderSurchargeHistorical;
};
