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
exports.SubscriptionsPeriodsController = void 0;
const SubscriptionsPeriods_1 = require("../../database/entities/tenant/SubscriptionsPeriods");
const base_controller_1 = require("../base.controller");
class SubscriptionsPeriodsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionsPeriods(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, SubscriptionsPeriods_1.SubscriptionsPeriods);
        });
    }
    getSubscriptionsPeriodBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SubscriptionsPeriods_1.SubscriptionsPeriods);
        });
    }
    addSubscriptionsPeriods(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionsPeriods_1.SubscriptionsPeriods);
        });
    }
    updateSubscriptionsPeriods(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, SubscriptionsPeriods_1.SubscriptionsPeriods);
        });
    }
    deleteSubscriptionsPeriods(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SubscriptionsPeriods_1.SubscriptionsPeriods);
        });
    }
}
exports.SubscriptionsPeriodsController = SubscriptionsPeriodsController;
//# sourceMappingURL=subscriptionsPeriods.controller.js.map