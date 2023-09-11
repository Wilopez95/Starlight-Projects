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
exports.RecurrentOrderTemplateOrderController = void 0;
const RecurrentOrderTemplateOrder_1 = require("../../database/entities/tenant/RecurrentOrderTemplateOrder");
const base_controller_1 = require("../base.controller");
const orderStatuses_1 = require("../../consts/orderStatuses");
class RecurrentOrderTemplateOrderController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getRecurrentOrderTemplateOrder(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder);
        });
    }
    getRecurrentOrderTemplateOrderBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder);
        });
    }
    countNotFinalized(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const recurrentOrder = yield dataSource.createQueryBuilder()
                .select("recurrentOrderTemplateOrder")
                .from(RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder, "recurrentOrderTemplateOrder")
                .innerJoin("Orders", "orders", "orders.id = recurrentOrderTemplateOrder.orderId")
                .where("recurrentOrderTemplateOrder.recurrentOrderTemplateId = :id", ctx.request.body)
                .andWhere("orders.status IN (:...status)", {
                status: [
                    orderStatuses_1.ORDER_STATUS.inProgress,
                    orderStatuses_1.ORDER_STATUS.completed,
                    orderStatuses_1.ORDER_STATUS.approved,
                ],
            })
                .getCount();
            yield dataSource.destroy();
            ctx.body = recurrentOrder;
            ctx.status = 200;
            return next();
        });
    }
    addRecurrentOrderTemplateOrder(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder);
        });
    }
    bulkAddRecurrentOrderTemplateOrder(ctx, next) {
        const _super = Object.create(null, {
            bulkInsert: { get: () => super.bulkInsert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.request.body.data;
            return _super.bulkInsert.call(this, ctx, next, RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder);
        });
    }
    updateRecurrentOrderTemplateOrder(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder);
        });
    }
    deleteRecurrentOrderTemplateOrder(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder);
        });
    }
}
exports.RecurrentOrderTemplateOrderController = RecurrentOrderTemplateOrderController;
//# sourceMappingURL=recurrentOrderTemplateOrder.controller.js.map