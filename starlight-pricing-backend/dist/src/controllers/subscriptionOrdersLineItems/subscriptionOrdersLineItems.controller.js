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
exports.SubscriptionOrdersLineItemsController = void 0;
const SubscriptionOrdersLineItemsHistorical_1 = require("../../database/entities/tenant/SubscriptionOrdersLineItemsHistorical");
const SubscriptionOrdersLineItems_1 = require("../../database/entities/tenant/SubscriptionOrdersLineItems");
const base_controller_1 = require("../base.controller");
class SubscriptionOrdersLineItemsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionOrdersLineItems(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems);
        });
    }
    getSubscriptionOrdersLineItemBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems);
        });
    }
    addSubscriptionOrdersLineItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems, SubscriptionOrdersLineItemsHistorical_1.SubscriptionOrdersLineItemsHistorical);
        });
    }
    updateSubscriptionOrdersLineItems(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems, SubscriptionOrdersLineItemsHistorical_1.SubscriptionOrdersLineItemsHistorical);
        });
    }
    deleteSubscriptionOrdersLineItems(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems, SubscriptionOrdersLineItemsHistorical_1.SubscriptionOrdersLineItemsHistorical);
        });
    }
    bulkAddSubscriptionOrdersLineItems(ctx, next) {
        const _super = Object.create(null, {
            bulkInserts: { get: () => super.bulkInserts }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = body.data;
            return _super.bulkInserts.call(this, ctx, next, SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems, SubscriptionOrdersLineItemsHistorical_1.SubscriptionOrdersLineItemsHistorical);
        });
    }
    upsertSubscriptionOrdersLineItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.delete(SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems, {
                subscriptionOrderId: ctx.request.body[0].subscriptionOrderId,
            });
            yield dataSource.destroy();
            return _super.insert.call(this, ctx, next, SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems, SubscriptionOrdersLineItemsHistorical_1.SubscriptionOrdersLineItemsHistorical);
        });
    }
}
exports.SubscriptionOrdersLineItemsController = SubscriptionOrdersLineItemsController;
//# sourceMappingURL=subscriptionOrdersLineItems.controller.js.map