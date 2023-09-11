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
exports.CustomRatesGroupLineItemsController = void 0;
const CustomRatesGroupLineItems_1 = require("../../database/entities/tenant/CustomRatesGroupLineItems");
const CustomRatesGroupLineItemsHistorical_1 = require("../../database/entities/tenant/CustomRatesGroupLineItemsHistorical");
const base_controller_1 = require("../base.controller");
class CustomRatesGroupLineItemsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getCustomerRatesGroupLineItems(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, CustomRatesGroupLineItems_1.CustomRatesGroupLineItems);
        });
    }
    getCustomerRatesGroupLineItemsBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, CustomRatesGroupLineItems_1.CustomRatesGroupLineItems);
        });
    }
    addCustomerRatesGroupLineItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, CustomRatesGroupLineItems_1.CustomRatesGroupLineItems, CustomRatesGroupLineItemsHistorical_1.CustomRatesGroupLineItemsHistorical);
        });
    }
    updateCustomerRatesGroupLineItems(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, CustomRatesGroupLineItems_1.CustomRatesGroupLineItems, CustomRatesGroupLineItemsHistorical_1.CustomRatesGroupLineItemsHistorical);
        });
    }
}
exports.CustomRatesGroupLineItemsController = CustomRatesGroupLineItemsController;
//# sourceMappingURL=customRatesGroupLineItems.controller.js.map