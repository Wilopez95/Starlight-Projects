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
exports.CustomRatesGroupRecurringLineItemBillingCycleHistoricalController = void 0;
const CustomRatesGroupRecurringLineItemBillingCycleHistorical_1 = require("../../database/entities/tenant/CustomRatesGroupRecurringLineItemBillingCycleHistorical");
const base_controller_1 = require("../base.controller");
class CustomRatesGroupRecurringLineItemBillingCycleHistoricalController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getCustomRatesRecurringLineItemBillingCycleHistorical(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, CustomRatesGroupRecurringLineItemBillingCycleHistorical_1.CustomRatesGroupRecurringLineItemBillingCycleHistorical);
        });
    }
    getCustomRatesRecurringLineItemBillingCycleHistoricalBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, CustomRatesGroupRecurringLineItemBillingCycleHistorical_1.CustomRatesGroupRecurringLineItemBillingCycleHistorical);
        });
    }
    addCustomRatesRecurringLineItemBillingCycleHistorical(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, CustomRatesGroupRecurringLineItemBillingCycleHistorical_1.CustomRatesGroupRecurringLineItemBillingCycleHistorical);
        });
    }
}
exports.CustomRatesGroupRecurringLineItemBillingCycleHistoricalController = CustomRatesGroupRecurringLineItemBillingCycleHistoricalController;
//# sourceMappingURL=customRatesGroupRecurringLineItemsBillingCycleHistorical.controller.js.map