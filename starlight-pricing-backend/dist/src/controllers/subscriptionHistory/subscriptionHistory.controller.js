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
exports.SubscriptionHistoryController = void 0;
const SubscriptionHistory_1 = require("../../database/entities/tenant/SubscriptionHistory");
const base_controller_1 = require("../base.controller");
class SubscriptionHistoryController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionHistory(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = { where: { subscriptionId: +ctx.url.split("/")[4] }
            };
            return _super.getBy.call(this, ctx, next, SubscriptionHistory_1.SubscriptionHistory);
        });
    }
    getSubscriptionHistoryBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SubscriptionHistory_1.SubscriptionHistory);
        });
    }
    addSubscriptionHistory(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionHistory_1.SubscriptionHistory);
        });
    }
    updateSubscriptionHistory(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            return _super.update.call(this, ctx, next, SubscriptionHistory_1.SubscriptionHistory, undefined, id);
        });
    }
    deleteSubscriptionHistory(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.query;
            return _super.delete.call(this, ctx, next, SubscriptionHistory_1.SubscriptionHistory);
        });
    }
}
exports.SubscriptionHistoryController = SubscriptionHistoryController;
//# sourceMappingURL=subscriptionHistory.controller.js.map