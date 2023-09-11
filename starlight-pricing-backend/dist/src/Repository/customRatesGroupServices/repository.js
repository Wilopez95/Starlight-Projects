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
exports.upsertManyCustomRatesGroupServices = void 0;
const data_source_1 = require("../../data-source");
const CustomRatesGroupServices_1 = require("../../database/entities/tenant/CustomRatesGroupServices");
const CustomRatesGroupRecurringServiceFrequency_1 = require("../../database/entities/tenant/CustomRatesGroupRecurringServiceFrequency");
const _ = require("lodash");
const isNumericOrNAN_1 = require("../../utils/isNumericOrNAN");
const sender_1 = require("../../services/amqp/sender");
const hauling_1 = require("../../services/hauling");
const config_1 = require("../../config/config");
const mapOmitId = (items) => items.map((i) => _.omit(i, ["id"]));
const upsertManyCustomRatesGroupServices = ({ where, serviceRatesData, duplicate, ctx, }) => __awaiter(void 0, void 0, void 0, function* () {
    const mqSender = new sender_1.default();
    const dataBase = data_source_1.AppDataSource.manager;
    const itemsToRemove = [];
    const inputData = mapOmitId(serviceRatesData);
    const data = inputData.filter((item) => {
        if (where.customRatesGroupId) {
            item.customRatesGroupId = where.customRatesGroupId;
        }
        if ((0, isNumericOrNAN_1.isNumericOrNaN)(item.price) && !item.frequencies) {
            itemsToRemove.push(_.pick(item, ["id"]));
        }
        return item;
    });
    try {
        if (data === null || data === void 0 ? void 0 : data.length) {
            const allServices = data.map((el) => _.omit(el, ["frequencies", "billingCycle"]));
            const serviceRates = yield dataBase
                .createQueryBuilder()
                .insert()
                .into(CustomRatesGroupServices_1.CustomRatesGroupServices)
                .values(allServices)
                .select("*")
                .execute();
            // on duplicate incoming data has no frequencies
            // so we need to create new custom price group billable services frequency relations
            if (duplicate) {
                const customRatesServicesFrequenciesRelations = yield Promise.all(serviceRatesData.map((item, idx) => __awaiter(void 0, void 0, void 0, function* () {
                    const freqRelation = yield dataBase.findBy(CustomRatesGroupRecurringServiceFrequency_1.CustomRatesGroupRecurringServiceFrequency, { customRatesGroupRecurringServiceId: item.id });
                    if (!(freqRelation === null || freqRelation === void 0 ? void 0 : freqRelation.length)) {
                        return null;
                    }
                    return freqRelation.map((freq) => (Object.assign(Object.assign({}, freq), { customRatesGroupRecurringServiceId: serviceRates[idx].id })));
                })));
                const existingRelations = mapOmitId((customRatesServicesFrequenciesRelations || []).flat().filter(Boolean));
                if (existingRelations === null || existingRelations === void 0 ? void 0 : existingRelations.length) {
                    yield dataBase
                        .createQueryBuilder()
                        .insert()
                        .into(CustomRatesGroupRecurringServiceFrequency_1.CustomRatesGroupRecurringServiceFrequency)
                        .values(existingRelations)
                        .select("*")
                        .execute();
                }
            }
            const recurringServiceRates = yield (0, hauling_1.haulingBillableServiceFrequencyRepo)(ctx, serviceRates);
            if (recurringServiceRates === null || recurringServiceRates === void 0 ? void 0 : recurringServiceRates.length) {
                const ratesToRemove = [];
                const ratesToUpsert = recurringServiceRates
                    .flat()
                    .filter((frequency) => {
                    if (!frequency) {
                        return false;
                    }
                    if (frequency.price === null) {
                        ratesToRemove.push({
                            customRatesGroupRecurringServiceId: frequency.customRatesGroupRecurringServiceId,
                            billableServiceFrequencyId: frequency.billableServiceFrequencyId,
                            billingCycle: frequency.billingCycle,
                        });
                        return false;
                    }
                    return true;
                });
                if (ratesToRemove === null || ratesToRemove === void 0 ? void 0 : ratesToRemove.length) {
                    yield dataBase
                        .createQueryBuilder()
                        .delete()
                        .from(CustomRatesGroupRecurringServiceFrequency_1.CustomRatesGroupRecurringServiceFrequency)
                        .where({ where })
                        .execute();
                }
                if ((ratesToUpsert === null || ratesToUpsert === void 0 ? void 0 : ratesToUpsert.length) &&
                    config_1.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES) {
                    yield Promise.all([
                        dataBase
                            .createQueryBuilder()
                            .insert()
                            .into(CustomRatesGroupRecurringServiceFrequency_1.CustomRatesGroupRecurringServiceFrequency)
                            .values(ratesToUpsert)
                            .select("*")
                            .execute(),
                        mqSender.sendTo(ctx, config_1.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
                            customServiceRates: ratesToUpsert,
                        }),
                    ]);
                }
            }
        }
        if (itemsToRemove === null || itemsToRemove === void 0 ? void 0 : itemsToRemove.length) {
            yield dataBase
                .createQueryBuilder()
                .delete()
                .from(CustomRatesGroupServices_1.CustomRatesGroupServices)
                .where({ where })
                .execute();
        }
    }
    catch (error) {
        throw error;
    }
});
exports.upsertManyCustomRatesGroupServices = upsertManyCustomRatesGroupServices;
//# sourceMappingURL=repository.js.map