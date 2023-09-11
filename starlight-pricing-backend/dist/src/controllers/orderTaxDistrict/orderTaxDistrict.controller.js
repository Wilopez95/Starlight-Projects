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
exports.OrderTaxDistrictController = void 0;
const typeorm_1 = require("typeorm");
const OrderTaxDistrict_1 = require("../../database/entities/tenant/OrderTaxDistrict");
const base_controller_1 = require("../base.controller");
class OrderTaxDistrictController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getOrderTaxDistrict(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let orderId = ctx.request.body.id;
            let where = {};
            const { ids } = ctx.request.body;
            if (orderId) {
                where.orderId = orderId;
            }
            if (ids) {
                where.orderId = (0, typeorm_1.In)(ids);
            }
            let body = {};
            body.where = where;
            ctx.request.body = body;
            return _super.getBy.call(this, ctx, next, OrderTaxDistrict_1.OrderTaxDistrict);
        });
    }
    getOrderTaxDistrictBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, OrderTaxDistrict_1.OrderTaxDistrict);
        });
    }
    addOrderTaxDistrict(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, OrderTaxDistrict_1.OrderTaxDistrict);
        });
    }
    bulkAddOrderTaxDistrict(ctx, next) {
        const _super = Object.create(null, {
            bulkInsert: { get: () => super.bulkInsert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.request.body.data;
            return _super.bulkInsert.call(this, ctx, next, OrderTaxDistrict_1.OrderTaxDistrict);
        });
    }
}
exports.OrderTaxDistrictController = OrderTaxDistrictController;
//# sourceMappingURL=orderTaxDistrict.controller.js.map