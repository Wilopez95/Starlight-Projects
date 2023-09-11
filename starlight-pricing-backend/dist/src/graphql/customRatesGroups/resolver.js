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
exports.selectRatesGroupResolver = exports.customRatesGroupsResolver = void 0;
const data_source_1 = require("../../data-source");
const CustomRatesGroups_1 = require("../../database/entities/tenant/CustomRatesGroups");
const typeorm_1 = require("typeorm");
const ServiceAreasCustomRatesGroups_1 = require("../../database/entities/tenant/ServiceAreasCustomRatesGroups");
const dateFnsTz = require("date-fns-tz");
const dateFns = require("date-fns");
const customRatesGroupsResolver = (args) => __awaiter(void 0, void 0, void 0, function* () {
    let where = {};
    let skip = args.skip ? args.skip : 0;
    if (args.id) {
        where.id = args.id;
    }
    if (args.businessLineId) {
        where.businessLineId = args.businessLineId;
    }
    if (args.businessUnitId) {
        where.businessUnitId = args.businessUnitId;
    }
    if (args.active) {
        where.active = args.active;
    }
    let query = data_source_1.AppDataSource.manager
        .getRepository(CustomRatesGroups_1.CustomRatesGroups)
        .createQueryBuilder("crg");
    if (args.type) {
        switch (args.type) {
            case "customerGroup":
                where.customerGroupId = (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
                break;
            case "customer":
                where.customerId = (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
                break;
            case "customerJobSite":
                where.customerJobSiteId = (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
                break;
            case "serviceArea":
                if (args.serviceAreaIds) {
                    const serviceAreaIds = args.serviceAreaIds;
                    query = query.innerJoinAndMapMany("crg.serviceAreaIds", ServiceAreasCustomRatesGroups_1.ServiceAreasCustomRatesGroups, "sacrg", "sacrg.customRatesGroupId = crg.id AND sacrg.serviceAreaId IN(:...serviceAreaIds)", { serviceAreaIds });
                }
                else {
                    query = query.innerJoinAndMapMany("crg.serviceAreaIds", ServiceAreasCustomRatesGroups_1.ServiceAreasCustomRatesGroups, "sacrg", "sacrg.customRatesGroupId = crg.id");
                }
            default:
                break;
        }
    }
    if (args.limit) {
        query = query.take(args.limit);
    }
    let dataDBResponse = yield query
        .where(where)
        .skip(skip)
        .orderBy("crg.id", "DESC")
        .getMany();
    if (args.type === "serviceArea") {
        dataDBResponse = dataDBResponse.filter((item) => {
            if (!item.serviceAreaIds)
                return;
            const serviceAreaIds = item.serviceAreaIds;
            item.serviceAreaIds = serviceAreaIds.map((x) => x.serviceAreaId);
            return item;
        });
    }
    return dataDBResponse !== null && dataDBResponse !== void 0 ? dataDBResponse : [];
});
exports.customRatesGroupsResolver = customRatesGroupsResolver;
const selectRatesGroupResolver = (args) => __awaiter(void 0, void 0, void 0, function* () {
    let where = {};
    let weekendDay = 0;
    if (args.businessLineId) {
        where.businessLineId = args.businessLineId;
    }
    if (args.businessUnitId) {
        where.businessUnitId = args.businessUnitId;
    }
    if (args.customerGroupId) {
        where.customerGroupId = args.customerGroupId;
    }
    if (args.customerJobSiteId) {
        where.customerJobSiteId = args.customerJobSiteId;
    }
    if (args.customerId) {
        where.customerId = args.customerId;
    }
    let query = data_source_1.AppDataSource.manager
        .getRepository(CustomRatesGroups_1.CustomRatesGroups)
        .createQueryBuilder("crg")
        .where(where);
    if (args.serviceAreaId) {
        query = query.innerJoinAndMapMany("crg.serviceAreaId", ServiceAreasCustomRatesGroups_1.ServiceAreasCustomRatesGroups, "sacrg", `sacrg.customRatesGroupId = crg.id AND sacrg.serviceAreaId = ${args.serviceAreaId}`);
    }
    if (args.serviceDate) {
        const date = new Date(args.serviceDate);
        weekendDay = dateFns.getDay(dateFnsTz.zonedTimeToUtc(date, "UTC"));
        query = query.andWhere(`${weekendDay} = ANY (crg.validDays)`);
    }
    let dataDBResponse = yield query.getMany();
    if (args.serviceAreaId) {
        dataDBResponse = dataDBResponse.map((item) => {
            return Object.assign(Object.assign({}, item), { serviceAreaId: args.serviceAreaId });
        });
    }
    return dataDBResponse;
});
exports.selectRatesGroupResolver = selectRatesGroupResolver;
//# sourceMappingURL=resolver.js.map