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
exports.upsertManyCustomRatesGroupLineItems = void 0;
const data_source_1 = require("../../data-source");
const CustomRatesGroupLineItems_1 = require("../../database/entities/tenant/CustomRatesGroupLineItems");
const CustomRatesGroupRecurringLineItemBillingCycle_1 = require("../../database/entities/tenant/CustomRatesGroupRecurringLineItemBillingCycle");
const _ = require("lodash");
const isNumericOrNAN_1 = require("../../utils/isNumericOrNAN");
const sender_1 = require("../../services/amqp/sender");
const config_1 = require("../../config/config");
const hauling_1 = require("../../services/hauling");
const upsertManyCustomRatesGroupLineItems = ({ where, oldData, ctx, }) => __awaiter(void 0, void 0, void 0, function* () {
    const dataBase = data_source_1.AppDataSource.manager;
    const mqSender = new sender_1.default();
    const itemsToRemove = [];
    const data = oldData.filter((item) => {
        if (where.customRatesGroupId) {
            item.customRatesGroupId = where.customRatesGroupId;
        }
        if (!item.materialId) {
            item.materialId = null;
        }
        if ((0, isNumericOrNAN_1.isNumericOrNaN)(item.price) && !item.billingCycles) {
            itemsToRemove.push(_.pick(item, ["id"]));
            return;
        }
        if (!_.isEmpty(item.billingCycles)) {
            item.oneTime = false;
            item.materialId = null;
        }
        return item;
    }, this);
    try {
        if (data === null || data === void 0 ? void 0 : data.length) {
            const allLineItems = data.map((el) => _.omit(el, "billingCycles"));
            const lineItemRates = yield dataBase
                .createQueryBuilder()
                .insert()
                .into(CustomRatesGroupLineItems_1.CustomRatesGroupLineItems)
                .values(allLineItems)
                .select("*")
                .execute();
            const recurringlineItemRates = yield (0, hauling_1.haulingBillableLineItemBillingCycleRepo)(ctx, lineItemRates);
            if (recurringlineItemRates === null || recurringlineItemRates === void 0 ? void 0 : recurringlineItemRates.length) {
                const ratesToRemove = [];
                const itemsToUpsert = recurringlineItemRates
                    .flat()
                    .filter((billingCycle) => {
                    if (!billingCycle) {
                        return false;
                    }
                    if (billingCycle.price === null) {
                        ratesToRemove.push(_.pick(billingCycle, [
                            "customRatesGroupRecurringLineItemId",
                            "billableLineItemBillingCycleId",
                        ]));
                        return false;
                    }
                    return true;
                });
                if (ratesToRemove === null || ratesToRemove === void 0 ? void 0 : ratesToRemove.length) {
                    yield dataBase
                        .createQueryBuilder()
                        .delete()
                        .from(CustomRatesGroupRecurringLineItemBillingCycle_1.CustomRatesGroupRecurringLineItemBillingCycle)
                        .where({ where })
                        .execute();
                }
                if ((itemsToUpsert === null || itemsToUpsert === void 0 ? void 0 : itemsToUpsert.length) &&
                    config_1.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES) {
                    yield Promise.all([
                        dataBase
                            .createQueryBuilder()
                            .insert()
                            .into(CustomRatesGroupRecurringLineItemBillingCycle_1.CustomRatesGroupRecurringLineItemBillingCycle)
                            .values(itemsToUpsert)
                            .select("*")
                            .execute(),
                        mqSender.sendTo(ctx, config_1.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
                            customServiceRates: itemsToUpsert,
                        }),
                    ]);
                }
            }
        }
        if (itemsToRemove === null || itemsToRemove === void 0 ? void 0 : itemsToRemove.length) {
            yield dataBase
                .createQueryBuilder()
                .delete()
                .from(CustomRatesGroupLineItems_1.CustomRatesGroupLineItems)
                .where({ where })
                .execute();
        }
    }
    catch (error) {
        throw error;
    }
});
exports.upsertManyCustomRatesGroupLineItems = upsertManyCustomRatesGroupLineItems;
//# sourceMappingURL=repository.js.map