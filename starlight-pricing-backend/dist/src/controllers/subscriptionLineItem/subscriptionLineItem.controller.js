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
exports.SubscriptionLineItemController = void 0;
const SubscriptionLineItem_1 = require("../../database/entities/tenant/SubscriptionLineItem");
const SubscriptionLineItemHistorical_1 = require("../../database/entities/tenant/SubscriptionLineItemHistorical");
const base_controller_1 = require("../base.controller");
class SubscriptionLineItemController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionLineItems(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, SubscriptionLineItem_1.SubscriptionLineItem);
        });
    }
    getSubscriptionLineItemBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SubscriptionLineItem_1.SubscriptionLineItem);
        });
    }
    addSubscriptionLineItem(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionLineItem_1.SubscriptionLineItem, SubscriptionLineItemHistorical_1.SubscriptionLineItemHistorical);
        });
    }
    bulkaddSubscriptionLineItem(ctx, next) {
        const _super = Object.create(null, {
            bulkInserts: { get: () => super.bulkInserts }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.request.body.data;
            return _super.bulkInserts.call(this, ctx, next, SubscriptionLineItem_1.SubscriptionLineItem, SubscriptionLineItemHistorical_1.SubscriptionLineItemHistorical);
        });
    }
    updateSubscriptionLineItem(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            delete ctx.request.body.lineItems;
            return _super.update.call(this, ctx, next, SubscriptionLineItem_1.SubscriptionLineItem, SubscriptionLineItemHistorical_1.SubscriptionLineItemHistorical, id);
        });
    }
    deleteSubscriptionLineItem(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SubscriptionLineItem_1.SubscriptionLineItem, SubscriptionLineItemHistorical_1.SubscriptionLineItemHistorical);
        });
    }
    upsertSubscriptionLineItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.request.body.data;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.update(SubscriptionLineItem_1.SubscriptionLineItem, { subscriptionId: ctx.request.body[0].subscriptionId }, { isDeleted: true });
            yield dataSource.destroy();
            return _super.insert.call(this, ctx, next, SubscriptionLineItem_1.SubscriptionLineItem);
        });
    }
    getItemBySpecificDate(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { lineItemId, specifiedDate } = ctx.request.body.data;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const subscription = yield dataSource
                .createQueryBuilder()
                .select("*")
                .addSelect("coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt)::timestamp as effective_date")
                .addSelect("subscription.billingCycle as billingCycle")
                .from(SubscriptionLineItemHistorical_1.SubscriptionLineItemHistorical, "subsLineItem")
                .innerJoin("SubscriptionServiceItem", "subsServiceItem", "subsLineItem.subscriptionServiceItemId = subsServiceItem.id")
                .innerJoin("Subscriptions", "subscription", "subsServiceItem.subscriptionId = subscription.id")
                .where({ originalId: lineItemId })
                .andWhere(`coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt) <= '${specifiedDate}'`)
                .orderBy("coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt)::timestamp", "DESC")
                .getRawOne();
            yield dataSource.destroy();
            ctx.body = subscription;
            ctx.status = 200;
            return next();
        });
    }
    getNextItemBySpecificDate(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { lineItemId, specifiedDate } = ctx.request.body.data;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const subscription = yield dataSource
                .createQueryBuilder()
                .select("*")
                .addSelect("coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt)::timestamp as effective_date")
                .from(SubscriptionLineItemHistorical_1.SubscriptionLineItemHistorical, "subsLineItem")
                .where({ originalId: lineItemId })
                .andWhere(`coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt) > '${specifiedDate}'`)
                .orderBy("coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt)::timestamp", "ASC")
                .getRawOne();
            yield dataSource.destroy();
            ctx.body = subscription;
            ctx.status = 200;
            return next();
        });
    }
}
exports.SubscriptionLineItemController = SubscriptionLineItemController;
//# sourceMappingURL=subscriptionLineItem.controller.js.map