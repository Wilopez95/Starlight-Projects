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
exports.SubscriptionRecurringLineItemsSchedulesController = void 0;
const SubscriptionRecurringLineItemsSchedule_1 = require("../../database/entities/tenant/SubscriptionRecurringLineItemsSchedule");
const base_controller_1 = require("../base.controller");
class SubscriptionRecurringLineItemsSchedulesController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionRecurringLineItemsSchedules(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, SubscriptionRecurringLineItemsSchedule_1.SubscriptionRecurringLineItemsSchedule);
        });
    }
    getSubscriptionRecurringLineItemsScheduleBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SubscriptionRecurringLineItemsSchedule_1.SubscriptionRecurringLineItemsSchedule);
        });
    }
    addSubscriptionRecurringLineItemsSchedules(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionRecurringLineItemsSchedule_1.SubscriptionRecurringLineItemsSchedule);
        });
    }
    updateSubscriptionRecurringLineItemsSchedules(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, SubscriptionRecurringLineItemsSchedule_1.SubscriptionRecurringLineItemsSchedule);
        });
    }
    deleteSubscriptionRecurringLineItemsSchedules(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SubscriptionRecurringLineItemsSchedule_1.SubscriptionRecurringLineItemsSchedule);
        });
    }
}
exports.SubscriptionRecurringLineItemsSchedulesController = SubscriptionRecurringLineItemsSchedulesController;
//# sourceMappingURL=subscriptionRecurringLineItemsSchedule.controller.js.map