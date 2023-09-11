"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderSurchargeHistoricalIds = exports.calculateSurcharges = exports.calcRates = void 0;
const lodash_1 = require("lodash");
const math_1 = require("./math");
const haulingRequest_1 = require("../request/haulingRequest");
const haulingRequest_2 = require("../request/haulingRequest");
const calcRates = (ctx, businessUnitId, businessLineId, customRatesGroupId, type, billableServiceId = null, equipmentItemId = null, materialId = null, billableLineItems = [], recurringLineItemIds = [], billingCycle = null, billableServiceIds = [], applySurcharges = true) => __awaiter(void 0, void 0, void 0, function* () {
    const billableService = { billableServiceId, equipmentItemId, materialId };
    let globalRatesService;
    if (billableServiceId) {
        globalRatesService = yield (0, haulingRequest_2.getGlobalRatesServices)(ctx, {
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
    if (billableLineItems === null || billableLineItems === void 0 ? void 0 : billableLineItems.length) {
        //ToDo:<Implements get from global_rates_line_items from core>
        //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
    }
    let globalRatesServiceItems;
    if (billableServiceIds === null || billableServiceIds === void 0 ? void 0 : billableServiceIds.length) {
        //ToDo:<Implements get from global_rates_line_items from core>
        //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
    }
    let globalRatesSurcharges;
    if (applySurcharges) {
        try {
            globalRatesSurcharges = yield (0, haulingRequest_2.getGlobalRatesSurcharges)(ctx, {
                data: { businessUnitId, businessLineId },
            });
        }
        catch (error) {
            ctx.logger.error(error);
        }
    }
    let globalRecurringLineItems;
    if (recurringLineItemIds === null || recurringLineItemIds === void 0 ? void 0 : recurringLineItemIds.length) {
        //ToDo:<Implements get from global_rates_recurring_line_items from core>
        //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
    }
    const globalRates = {
        globalRatesService,
        globalRatesLineItems,
        globalRatesServiceItems,
        globalRecurringLineItems,
        globalRatesSurcharges,
    };
    if (type === "global") {
        return { globalRates };
    }
    let customRatesService;
    if (billableServiceId) {
        //ToDo:<Implements get from custom_rates_group_services from core>
        //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
    }
    let customRatesLineItems;
    if (billableLineItems === null || billableLineItems === void 0 ? void 0 : billableLineItems.length) {
        //ToDo:<Implements get from custom_rates_group_line_items from core>
        //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
    }
    let customRatesSurcharges;
    if (applySurcharges) {
        try {
            customRatesSurcharges = yield (0, haulingRequest_2.getCustomGroupRatesSurcharges)(ctx, {
                data: { businessUnitId, businessLineId, customRatesGroupId },
            });
        }
        catch (error) {
            ctx.logger.error(error);
        }
    }
    let customRecurringLineItems;
    if (recurringLineItemIds === null || recurringLineItemIds === void 0 ? void 0 : recurringLineItemIds.length) {
        //ToDo:<Implements get from custom_rates_group_line_items from core>
        //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
    }
    let customRatesServiceItems;
    if (billableServiceIds === null || billableServiceIds === void 0 ? void 0 : billableServiceIds.length) {
        //ToDo:<Implements get from custom_rates_group_services from core>
        //By:<wlopez95> || Date: 29/08/2022 || TicketRelated : PS-271
    }
    const customRates = {
        customRatesService,
        customRatesLineItems,
        customRatesServiceItems,
        customRecurringLineItems,
        customRatesSurcharges,
    };
    const response = { customRates, globalRates };
    return response;
});
exports.calcRates = calcRates;
const calculateSurcharges = (globalRatesSurcharges, customRatesSurcharges, materialId, billableServiceId, billableServicePrice, billableServiceApplySurcharges, lineItems = [], surcharges = [], serviceQuantity = 1) => {
    let addedCustomRates = [];
    let addedGlobalRates = [];
    const globalRates = addedGlobalRates.concat(globalRatesSurcharges !== null && globalRatesSurcharges !== void 0 ? globalRatesSurcharges : []);
    const customRates = addedCustomRates.concat(customRatesSurcharges !== null && customRatesSurcharges !== void 0 ? customRatesSurcharges : []);
    const getGlobalRate = (surchargeId, rateMaterialId) => globalRates === null || globalRates === void 0 ? void 0 : globalRates.find((surchargeRate) => surchargeRate.surchargeId === surchargeId &&
        surchargeRate.materialId === rateMaterialId);
    const getCustomRate = (surchargeId, rateMaterialId) => customRates === null || customRates === void 0 ? void 0 : customRates.find((surchargeRate) => surchargeRate.surchargeId === surchargeId &&
        surchargeRate.materialId === rateMaterialId);
    const getRate = (surchargeId, rateMaterialId) => getCustomRate(surchargeId, rateMaterialId) ||
        getGlobalRate(surchargeId, rateMaterialId);
    let serviceTotalWithSurcharges = Number(billableServicePrice) || 0;
    let orderSurchargesTotal = 0;
    const lineItemsWithSurcharges = (0, lodash_1.cloneDeep)(lineItems);
    //Pending thresholds
    const orderSurcharges = [];
    surcharges === null || surcharges === void 0 ? void 0 : surcharges.forEach((surcharge) => {
        var _a, _b, _c, _d;
        let rate;
        if (surcharge.materialBasedPricing && materialId) {
            rate = getRate(surcharge.id, materialId);
        }
        else if (!surcharge.materialBasedPricing) {
            rate = getRate(surcharge.id, null);
        }
        if (surcharge.calculation === "flat" && rate) {
            orderSurchargesTotal = (0, math_1.mathRound2)(orderSurchargesTotal + (rate.price || 0));
            serviceTotalWithSurcharges = (0, math_1.mathRound2)(serviceTotalWithSurcharges + rate.price);
            orderSurcharges.push({
                surchargeId: surcharge.id,
                materialId,
                globalRatesSurchargesId: (_a = getGlobalRate(surcharge.id, surcharge.materialBasedPricing ? materialId : null)) === null || _a === void 0 ? void 0 : _a.id,
                customRatesGroupSurchargesId: ((_b = getCustomRate(surcharge.id, surcharge.materialBasedPricing ? materialId : null)) === null || _b === void 0 ? void 0 : _b.id) || null,
                amount: rate.price,
                quantity: serviceQuantity,
            });
        }
        if (surcharge.calculation === "percentage") {
            if (billableServiceApplySurcharges &&
                rate &&
                billableServicePrice !== 0) {
                const surchargeValue = (0, math_1.mathRound2)((billableServicePrice * (rate.price || 0)) / 100);
                orderSurchargesTotal = (0, math_1.mathRound2)(orderSurchargesTotal + surchargeValue);
                serviceTotalWithSurcharges = (0, math_1.mathRound2)(serviceTotalWithSurcharges + surchargeValue);
                orderSurcharges.push({
                    materialId,
                    billableServiceId,
                    surchargeId: surcharge.id,
                    globalRatesSurchargesId: (_c = getGlobalRate(surcharge.id, surcharge.materialBasedPricing ? materialId : null)) === null || _c === void 0 ? void 0 : _c.id,
                    customRatesGroupSurchargesId: ((_d = getCustomRate(surcharge.id, surcharge.materialBasedPricing ? materialId : null)) === null || _d === void 0 ? void 0 : _d.id) || null,
                    amount: surchargeValue,
                    quantity: serviceQuantity,
                });
            }
            lineItems === null || lineItems === void 0 ? void 0 : lineItems.forEach((lineItem, index) => {
                var _a, _b, _c, _d;
                let lineItemRate;
                const lineItemMaterialId = (_b = (_a = lineItem.materialId) !== null && _a !== void 0 ? _a : materialId) !== null && _b !== void 0 ? _b : null;
                if (surcharge.materialBasedPricing && lineItemMaterialId) {
                    lineItemRate = getRate(surcharge.id, lineItemMaterialId);
                }
                else if (!surcharge.materialBasedPricing) {
                    lineItemRate = getRate(surcharge.id, null);
                }
                const lineItemTotal = lineItem.price * lineItem.quantity;
                if (lineItem.applySurcharges && lineItemRate) {
                    const surchargeValue = (0, math_1.mathRound2)((lineItemTotal * (lineItemRate.price || 0)) / 100);
                    orderSurchargesTotal = (0, math_1.mathRound2)(orderSurchargesTotal + surchargeValue);
                    lineItemsWithSurcharges[index].price = (0, math_1.mathRound2)(lineItemsWithSurcharges[index].price +
                        (0, math_1.mathRound2)((lineItem.price * (lineItemRate.price || 0)) / 100));
                    orderSurcharges.push({
                        materialId: lineItemMaterialId,
                        surchargeId: surcharge.id,
                        billableLineItemId: lineItem.billableLineItemId,
                        globalRatesSurchargesId: (_c = getGlobalRate(surcharge.id, surcharge.materialBasedPricing ? lineItemMaterialId : null)) === null || _c === void 0 ? void 0 : _c.id,
                        customRatesGroupSurchargesId: ((_d = getCustomRate(surcharge.id, surcharge.materialBasedPricing ? lineItemMaterialId : null)) === null || _d === void 0 ? void 0 : _d.id) || null,
                        amount: surchargeValue,
                        quantity: lineItem.quantity,
                    });
                }
            });
            if (!surcharge.materialBasedPricing) {
                //ToDo:<Investigate the implementation of thressholds>
                //By:<wlopez95> || Date: 31/08/2022 || TicketRelated : PS-271
            }
        }
    });
    const response = {
        surchargesTotal: orderSurchargesTotal
            ? (0, math_1.mathRound2)(orderSurchargesTotal)
            : 0,
        serviceTotalWithSurcharges,
        lineItemsWithSurcharges,
        orderSurcharges,
    };
    return response;
};
exports.calculateSurcharges = calculateSurcharges;
const getOrderSurchargeHistoricalIds = (ctx, OrderSurcharge, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    let OrderSurchargeHistorical = [];
    for (let i = 0; i < OrderSurcharge.length; i++) {
        let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, {
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
            materialId: requestResponse.material.id,
            billableServiceId: requestResponse.billableService
                ? requestResponse.billableService.id
                : null,
            surchargeId: requestResponse.surcharge.id,
            billableLineItemId: requestResponse.billableLineItem
                ? requestResponse.billableLineItem.id
                : null,
            globalRatesSurchargesId: (requestResponse === null || requestResponse === void 0 ? void 0 : requestResponse.globalRatesSurcharge)
                ? requestResponse === null || requestResponse === void 0 ? void 0 : requestResponse.globalRatesSurcharge.id
                : null,
            customRatesGroupSurchargesId: (requestResponse === null || requestResponse === void 0 ? void 0 : requestResponse.customRatesGroupSurcharge)
                ? requestResponse.customRatesGroupSurcharge.id
                : null,
            amount: OrderSurcharge[i].amount,
            quantity: OrderSurcharge[i].quantity,
            orderId,
        });
    }
    return OrderSurchargeHistorical;
});
exports.getOrderSurchargeHistoricalIds = getOrderSurchargeHistoricalIds;
//# sourceMappingURL=calclSurcharges.js.map