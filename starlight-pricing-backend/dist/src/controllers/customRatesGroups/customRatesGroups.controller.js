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
exports.CustomRatesGroupsController = void 0;
const base_controller_1 = require("../base.controller");
const haulingRequest_1 = require("../../request/haulingRequest");
const repository_1 = require("../../Repository/customRatesGroups/repository");
const CustomRatesGroups_1 = require("./../../database/entities/tenant/CustomRatesGroups");
const httpStatusCodes_1 = require("../../consts/httpStatusCodes");
class CustomRatesGroupsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    addCustomRatesGroups(ctx, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = ctx.request.body;
            if (((_a = data.serviceAreaIds) === null || _a === void 0 ? void 0 : _a.length) > 0 && data.spUsed) {
                yield (0, repository_1.checkPriceGroups)(ctx);
            }
            const dataResponse = yield (0, repository_1.createCustomRatesGroupsRepo)(ctx, next);
            ctx.status = httpStatusCodes_1.default.CREATED;
            ctx.body = dataResponse;
            return next();
        });
    }
    updateCustomRatesGroups(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            return (0, repository_1.updateCustomRatesGroupsRepo)(ctx, next, id);
        });
    }
    duplicateCustomRatesGroups(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = ctx.params.id;
            if (!id) {
                ctx.status = httpStatusCodes_1.default.BAD_REQUEST;
                return next();
            }
            return (0, repository_1.duplicateCustomRatesGroupsRepo)(ctx, next, id);
        });
    }
    getCustomRatesGroups(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, sortBy, sortOrder, customerJobSiteId, businessUnitId, } = ctx.request.query;
            let paramLimit = 0;
            let paramSkip = 0;
            let paramSortBy = "";
            let paramSortOrder = "";
            let response = [];
            if (limit) {
                paramLimit = +limit;
            }
            if (skip) {
                paramSkip = +skip;
            }
            if (sortBy) {
                if (sortBy === "startDate") {
                    paramSortBy = "start_date";
                }
                if (sortBy === "endDate") {
                    paramSortBy = "end_date";
                }
                if (sortBy === "status") {
                    paramSortBy = "active";
                }
                if (sortBy === "description") {
                    paramSortBy = "description";
                }
            }
            if (sortOrder) {
                paramSortOrder = sortOrder;
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const customRatesGroup = yield dataSource.createQueryBuilder()
                .select("")
                .from(CustomRatesGroups_1.CustomRatesGroups, "customRates")
                .where(`customRates.customerJobSiteId = ${customerJobSiteId}`)
                .andWhere(`customRates.businessUnitId = ${businessUnitId}`)
                .limit(paramLimit)
                .skip(paramSkip)
                .orderBy(paramSortBy, paramSortOrder.toUpperCase())
                .getRawMany();
            for (let index = 0; index < customRatesGroup.length; index++) {
                let tmp = {};
                tmp.id = customRatesGroup[index].id;
                tmp.createdAt = customRatesGroup[index].created_at;
                tmp.updatedAt = customRatesGroup[index].updated_at;
                tmp.businessUnitId = customRatesGroup[index].business_unit_id;
                tmp.businessLineId = customRatesGroup[index].business_line_id;
                tmp.active = customRatesGroup[index].active;
                tmp.description = customRatesGroup[index].description;
                tmp.overweightSetting = customRatesGroup[index].overweight_setting;
                tmp.usageDaysSetting = customRatesGroup[index].usage_days_setting;
                tmp.demurrageSetting = customRatesGroup[index].demurrage_setting;
                tmp.customerGroupId = customRatesGroup[index].customer_group_id;
                tmp.customerId = customRatesGroup[index].customer_id;
                tmp.customerJobSiteId = customRatesGroup[index].customer_job_site_id;
                tmp.dumpSetting = customRatesGroup[index].dump_setting;
                tmp.loadSetting = customRatesGroup[index].load_setting;
                tmp.nonServiceHours = customRatesGroup[index].non_service_hours;
                tmp.spUsed = customRatesGroup[index].sp_used;
                tmp.validDays = customRatesGroup[index].valid_days;
                tmp.startDate = customRatesGroup[index].start_date;
                tmp.endDate = customRatesGroup[index].end_date;
                let requestbody = {
                    customerJobSiteId: tmp.customerJobSiteId,
                };
                let requestResponse = yield (0, haulingRequest_1.getJobSiteData)(ctx, { data: requestbody });
                tmp.customerJobSite = requestResponse.customerJobSite;
                tmp.customer = requestResponse.customerJobSite.customer;
                tmp.jobSite = requestResponse.customerJobSite.jobSite;
                response.push(tmp);
            }
            ctx.body = response;
            ctx.status = 200;
            yield dataSource.destroy();
            return next();
        });
    }
    getCustomRatesGroupBy(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = ctx.params;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const customRatesGroup = yield dataSource.createQueryBuilder()
                .select("customRates")
                .from(CustomRatesGroups_1.CustomRatesGroups, "customRates")
                .where(`customRates.id = ${id}`)
                .getOne();
            let requestbody = {
                customerJobSiteId: customRatesGroup.customerJobSiteId,
            };
            let requestResponse = yield (0, haulingRequest_1.getJobSiteData)(ctx, { data: requestbody });
            customRatesGroup.customerJobSite = requestResponse.customerJobSite;
            customRatesGroup.customer = requestResponse.customerJobSite.customer;
            customRatesGroup.jobSite = requestResponse.customerJobSite.jobSite;
            ctx.body = customRatesGroup;
            ctx.status = 200;
            yield dataSource.destroy();
            return next();
        });
    }
}
exports.CustomRatesGroupsController = CustomRatesGroupsController;
//# sourceMappingURL=customRatesGroups.controller.js.map