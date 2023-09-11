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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateCustomRatesGroupsRepo = exports.updateCustomRatesGroupsRepo = exports.createCustomRatesGroupsRepo = exports.checkPriceGroups = void 0;
const data_source_1 = require("../../data-source");
const CustomRatesGroups_1 = require("../../database/entities/tenant/CustomRatesGroups");
const _ = require("lodash");
const ApiError_1 = require("../../utils/ApiError");
const CustomRatesGroupsHistorical_1 = require("../../database/entities/tenant/CustomRatesGroupsHistorical");
const ServiceAreasCustomRatesGroups_1 = require("../../database/entities/tenant/ServiceAreasCustomRatesGroups");
const CustomRatesGroupServices_1 = require("../../database/entities/tenant/CustomRatesGroupServices");
const CustomRatesGroupLineItems_1 = require("../../database/entities/tenant/CustomRatesGroupLineItems");
const CustomRatesGroupThresholds_1 = require("../../database/entities/tenant/CustomRatesGroupThresholds");
const CustomRatesGroupSurcharges_1 = require("../../database/entities/tenant/CustomRatesGroupSurcharges");
const httpStatusCodes_1 = require("../../consts/httpStatusCodes");
const repository_1 = require("../customRatesGroupSurcharges/repository");
const repository_2 = require("../customRatesGroupThresholds/repository");
const repository_3 = require("../customRatesGroupServices/repository");
const repository_4 = require("../customRatesGroupLineItems/repository");
const checkPriceGroups = (ctx, currentPriceGroupId) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessUnitId, businessLineId, serviceAreaIds } = ctx.request.body;
    const existingSpPriceGroups = yield data_source_1.AppDataSource.manager
        .getRepository(CustomRatesGroups_1.CustomRatesGroups)
        .createQueryBuilder("crg")
        .where({
        businessUnitId,
        businessLineId,
        spUsed: true,
    })
        .innerJoinAndMapMany("crg.serviceAreaIds", "service_areas_custom_rates_groups", "sacrg", "sacrg.customRatesGroupId = crg.id AND sacrg.serviceAreaId IN(:...serviceAreaIds)", { serviceAreaIds })
        .take(0)
        .skip(0)
        .getMany();
    if (existingSpPriceGroups.length >= 1) {
        const exists = existingSpPriceGroups
            .filter((item) => String(item.id) !== String(currentPriceGroupId))
            .some((item) => {
            const serviceAreaIds = item.serviceAreaIds &&
                item.serviceAreaIds.map((x) => x.serviceAreaId);
            if (_.intersection(serviceAreaIds, serviceAreaIds).length > 0) {
                return item;
            }
        });
        if (exists) {
            throw ApiError_1.default.invalidRequest("Only one Price Group can be marked for SP usage for specific Service Area", "");
        }
    }
});
exports.checkPriceGroups = checkPriceGroups;
const mapDuplicatedItemsWithBULoB = (items, input) => items.map((i) => (Object.assign(Object.assign({}, i), { businessUnitId: input.businessUnitId, businessLineId: input.businessLineId })));
const createCustomRatesGroupsRepo = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const data = ctx.request.body;
    if (((_a = data.serviceAreaIds) === null || _a === void 0 ? void 0 : _a.length) > 0 && data.spUsed) {
        yield (0, exports.checkPriceGroups)(ctx);
    }
    const createCustomRatesGroups = yield data_source_1.AppDataSource.manager.insert(CustomRatesGroups_1.CustomRatesGroups, data);
    yield updateHistorical(data, (_b = createCustomRatesGroups.identifiers.pop()) === null || _b === void 0 ? void 0 : _b.id);
    if (((_c = data.serviceAreaIds) === null || _c === void 0 ? void 0 : _c.length) && data.id) {
        const addedServiceAreaIds = data.serviceAreaIds.map((serviceAreaId) => ({
            serviceAreaId,
            customRatesGroupId: data.id,
            createdAt: new Date(),
            updatedAt: null,
        }));
        yield data_source_1.AppDataSource.manager
            .createQueryBuilder()
            .insert()
            .into(ServiceAreasCustomRatesGroups_1.ServiceAreasCustomRatesGroups)
            .values(addedServiceAreaIds)
            .execute();
    }
    return createCustomRatesGroups.generatedMaps[0];
});
exports.createCustomRatesGroupsRepo = createCustomRatesGroupsRepo;
const updateCustomRatesGroupsRepo = (ctx, next, id) => __awaiter(void 0, void 0, void 0, function* () {
    const data = ctx.request.body;
    data.customerGroupId = data.customerGroupId || null;
    data.customerId = data.customerId || null;
    data.customerJobSiteId = data.customerJobSiteId || null;
    const { serviceAreaIds } = data, newCtx = __rest(data, ["serviceAreaIds"]);
    yield data_source_1.AppDataSource.manager.update(CustomRatesGroups_1.CustomRatesGroups, { id: id }, Object.assign(Object.assign({}, newCtx), { updatedAt: new Date() }));
    let dataGet = yield data_source_1.AppDataSource.manager.findOneBy(CustomRatesGroups_1.CustomRatesGroups, {
        id,
    });
    let historical = Object.assign(Object.assign({}, data), { originalId: id, eventType: "edited", userId: "system", createdAt: new Date(), updatedAt: new Date(), traceId: "trace_id" });
    yield data_source_1.AppDataSource.manager.insert(CustomRatesGroupsHistorical_1.CustomRatesGroupsHistorical, historical);
    if (id && (serviceAreaIds === null || serviceAreaIds === void 0 ? void 0 : serviceAreaIds.length) > 0) {
        yield data_source_1.AppDataSource.manager.delete(ServiceAreasCustomRatesGroups_1.ServiceAreasCustomRatesGroups, {
            customRatesGroupId: id,
        });
        const addedServiceAreaIds = serviceAreaIds.map((serviceAreaId) => ({
            serviceAreaId,
            customRatesGroupId: id,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        yield data_source_1.AppDataSource.manager
            .createQueryBuilder()
            .insert()
            .into(ServiceAreasCustomRatesGroups_1.ServiceAreasCustomRatesGroups)
            .values(addedServiceAreaIds)
            .execute();
    }
    ctx.body = Object.assign(Object.assign({}, dataGet), { serviceAreaIds });
    ctx.status = httpStatusCodes_1.default.OK;
    return next();
});
exports.updateCustomRatesGroupsRepo = updateCustomRatesGroupsRepo;
const duplicateCustomRatesGroupsRepo = (ctx, next, id) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: customRatesGroupId } = ctx.params;
    const data = ctx.request.body;
    const dataBase = data_source_1.AppDataSource.manager;
    const newCustomRatesGroup = yield (0, exports.createCustomRatesGroupsRepo)(ctx, next);
    const where = { customRatesGroupId };
    const [serviceRates, lineItemRates, thresholdRates, surchargeRates] = yield Promise.all([
        dataBase.findBy(CustomRatesGroupServices_1.CustomRatesGroupServices, where),
        dataBase.findBy(CustomRatesGroupLineItems_1.CustomRatesGroupLineItems, where),
        dataBase.findBy(CustomRatesGroupThresholds_1.CustomRatesGroupThresholds, where),
        dataBase.findBy(CustomRatesGroupSurcharges_1.CustomRatesGroupSurcharges, where),
    ]);
    where.customRatesGroupId = newCustomRatesGroup.id;
    where.businessUnitId = data.businessUnitId;
    where.businessLineId = data.businessLineId;
    yield Promise.all([
        (serviceRates === null || serviceRates === void 0 ? void 0 : serviceRates.length)
            ? (0, repository_3.upsertManyCustomRatesGroupServices)({
                where,
                serviceRatesData: mapDuplicatedItemsWithBULoB(serviceRates, data),
                duplicate: true,
                ctx,
            })
            : Promise.resolve(),
        (lineItemRates === null || lineItemRates === void 0 ? void 0 : lineItemRates.length)
            ? (0, repository_4.upsertManyCustomRatesGroupLineItems)({
                where,
                oldData: mapDuplicatedItemsWithBULoB(lineItemRates, data),
                ctx,
            })
            : Promise.resolve(),
        (thresholdRates === null || thresholdRates === void 0 ? void 0 : thresholdRates.length)
            ? (0, repository_2.upsertManyCustomRatesGroupThresholds)({
                where,
                oldData: mapDuplicatedItemsWithBULoB(thresholdRates, data),
            })
            : Promise.resolve(),
        (surchargeRates === null || surchargeRates === void 0 ? void 0 : surchargeRates.length)
            ? (0, repository_1.upsertManyCustomRatesGroupSurcharges)({
                where,
                oldData: mapDuplicatedItemsWithBULoB(surchargeRates, data),
            })
            : Promise.resolve(),
    ]);
    ctx.status = httpStatusCodes_1.default.CREATED;
    ctx.body = newCustomRatesGroup;
});
exports.duplicateCustomRatesGroupsRepo = duplicateCustomRatesGroupsRepo;
const updateHistorical = (data, id) => {
    return data_source_1.AppDataSource.manager.insert(CustomRatesGroupsHistorical_1.CustomRatesGroupsHistorical, Object.assign(Object.assign({}, data), { originalId: id, eventType: "created", userId: "system", createdAt: new Date(), updatedAt: new Date(), traceId: "trace_id" }));
};
//# sourceMappingURL=repository.js.map