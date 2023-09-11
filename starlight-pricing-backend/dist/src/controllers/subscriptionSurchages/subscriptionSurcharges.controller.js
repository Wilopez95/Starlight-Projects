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
exports.SubscriptionSurchargeItemController = void 0;
const SubscriptionSurchargeItemHistorical_1 = require("../../database/entities/tenant/SubscriptionSurchargeItemHistorical");
const typeorm_1 = require("typeorm");
const SubscriptionSurchargeItem_1 = require("../../database/entities/tenant/SubscriptionSurchargeItem");
const base_controller_1 = require("../base.controller");
class SubscriptionSurchargeItemController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, SubscriptionSurchargeItem_1.SubscriptionSurchargeItem);
        });
    }
    getSubscriptionSurchargeItemBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SubscriptionSurchargeItem_1.SubscriptionSurchargeItem);
        });
    }
    addSubscriptionSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionSurchargeItem_1.SubscriptionSurchargeItem, SubscriptionSurchargeItemHistorical_1.SubscriptionSurchargeItemHistorical);
        });
    }
    upsertSubscriptionSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            bulkInserts: { get: () => super.bulkInserts }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = ctx.request.body.id;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const lineItemsIds = yield dataSource.createQueryBuilder()
                .select("subscriptionSurcharge.id")
                .from(SubscriptionSurchargeItem_1.SubscriptionSurchargeItem, "subscriptionSurcharge")
                .where(`subscriptionSurcharge.subscriptionOrderId = ${id}`)
                .getMany();
            if (lineItemsIds.length > 0) {
                const ids = lineItemsIds.map((item) => item.id);
                dataSource.manager.delete(SubscriptionSurchargeItem_1.SubscriptionSurchargeItem, {
                    id: (0, typeorm_1.In)(ids),
                });
            }
            yield dataSource.destroy();
            ctx.request.body = ctx.request.body.data;
            return _super.bulkInserts.call(this, ctx, next, SubscriptionSurchargeItem_1.SubscriptionSurchargeItem, SubscriptionSurchargeItemHistorical_1.SubscriptionSurchargeItemHistorical);
        });
    }
    updateSubscriptionSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, SubscriptionSurchargeItem_1.SubscriptionSurchargeItem, SubscriptionSurchargeItemHistorical_1.SubscriptionSurchargeItemHistorical);
        });
    }
    deleteSubscriptionSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SubscriptionSurchargeItem_1.SubscriptionSurchargeItem, SubscriptionSurchargeItemHistorical_1.SubscriptionSurchargeItemHistorical);
        });
    }
}
exports.SubscriptionSurchargeItemController = SubscriptionSurchargeItemController;
//# sourceMappingURL=subscriptionSurcharges.controller.js.map