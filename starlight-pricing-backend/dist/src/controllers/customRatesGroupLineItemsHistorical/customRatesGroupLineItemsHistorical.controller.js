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
exports.CustomRatesGroupLineItemsHistoricalController = void 0;
const CustomRatesGroupLineItemsHistorical_1 = require("../../database/entities/tenant/CustomRatesGroupLineItemsHistorical");
const base_controller_1 = require("../base.controller");
class CustomRatesGroupLineItemsHistoricalController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getCustomerRatesGroupLineItemsHistorical(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, CustomRatesGroupLineItemsHistorical_1.CustomRatesGroupLineItemsHistorical);
        });
    }
    getCustomerRatesGroupLineItemsHistoricalBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, CustomRatesGroupLineItemsHistorical_1.CustomRatesGroupLineItemsHistorical);
        });
    }
    addCustomerRatesGroupLineItemsHistorical(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, CustomRatesGroupLineItemsHistorical_1.CustomRatesGroupLineItemsHistorical);
        });
    }
}
exports.CustomRatesGroupLineItemsHistoricalController = CustomRatesGroupLineItemsHistoricalController;
//# sourceMappingURL=customRatesGroupLineItemsHistorical.controller.js.map