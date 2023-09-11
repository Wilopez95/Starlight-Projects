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
exports.PriceGroupController = void 0;
const PriceGroupsHistorical_1 = require("./../../database/entities/tenant/PriceGroupsHistorical");
const PriceGroups_1 = require("../../database/entities/tenant/PriceGroups");
const base_controller_1 = require("../base.controller");
const typeorm_1 = require("typeorm");
const Prices_1 = require("../../database/entities/tenant/Prices");
class PriceGroupController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getPriceGroup(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, PriceGroups_1.PriceGroups);
        });
    }
    getPriceGroupByType(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let where = {};
            let body = {};
            if (ctx.request.query.businessUnitId) {
                where.businessUnitId = +ctx.request.query.businessUnitId;
            }
            if (ctx.request.query.businessLineId) {
                where.businessLineId = +ctx.request.query.businessLineId;
            }
            if (ctx.request.query.skip) {
                let skip = +ctx.request.query.skip;
                body.skip = skip;
            }
            if (ctx.request.query.limit) {
                let take = +ctx.request.query.limit;
                body.take = take;
            }
            let type = ctx.request.query.type;
            if (type === "customerGroup") {
                where.customerGroupId = (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
            }
            else if (type === "customer") {
                where.customerId = (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
            }
            else if (type === "customerJobSite") {
                where.customerJobSiteId = (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
            }
            else if (type === "serviceArea") {
                where.serviceAreaIds = (0, typeorm_1.Not)([]);
            }
            let active = ctx.request.query.activeOnly === "true";
            if (active) {
                where.active = true;
            }
            body.where = where;
            ctx.request.body = body;
            return _super.getBy.call(this, ctx, next, PriceGroups_1.PriceGroups);
        });
    }
    getPriceGroupBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, PriceGroups_1.PriceGroups);
        });
    }
    addPriceGroup(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, PriceGroups_1.PriceGroups, PriceGroupsHistorical_1.PriceGroupsHistorical);
        });
    }
    updatePriceGroup(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            return _super.update.call(this, ctx, next, PriceGroups_1.PriceGroups, PriceGroupsHistorical_1.PriceGroupsHistorical, id);
        });
    }
    deletePriceGroup(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, PriceGroups_1.PriceGroups, PriceGroupsHistorical_1.PriceGroupsHistorical);
        });
    }
    duplicatePriceGroup(ctx, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let prices = yield dataSource.manager.findBy(Prices_1.Prices, {
                priceGroupId: +ctx.url.split("/")[4],
            });
            let newPriceGroup = yield dataSource.manager.insert(PriceGroups_1.PriceGroups, ctx.request.body);
            let newPriceGroupID = (_a = newPriceGroup === null || newPriceGroup === void 0 ? void 0 : newPriceGroup.identifiers.pop()) === null || _a === void 0 ? void 0 : _a.id;
            let body = yield dataSource.manager.findOneBy(PriceGroups_1.PriceGroups, {
                id: newPriceGroupID,
            });
            if (prices && newPriceGroupID) {
                let pricesToInsert = [];
                prices.forEach((price) => {
                    price.priceGroupId = newPriceGroupID;
                    pricesToInsert.push(price);
                });
                yield dataSource.manager.insert(Prices_1.Prices, pricesToInsert);
            }
            yield dataSource.destroy();
            ctx.body = body;
            ctx.status = 200;
            return next();
        });
    }
}
exports.PriceGroupController = PriceGroupController;
//# sourceMappingURL=priceGroup.controller.js.map