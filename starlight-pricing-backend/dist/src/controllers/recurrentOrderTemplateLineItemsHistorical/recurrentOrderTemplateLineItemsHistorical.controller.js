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
exports.RecurrentOrderTemplateLineItemsHistoricalController = void 0;
const RecurrentOrderTemplateLineItemsHistorical_1 = require("../../database/entities/tenant/RecurrentOrderTemplateLineItemsHistorical");
const base_controller_1 = require("../base.controller");
class RecurrentOrderTemplateLineItemsHistoricalController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getRecurrentOrderTemplateLineItemsHistorical(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
    getRecurrentOrderTemplateLineItemsHistoricalBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
    addRecurrentOrderTemplateLineItemsHistorical(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
    updateRecurrentOrderTemplateLineItemsHistorical(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
    deleteRecurrentOrderTemplateLineItemsHistorical(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
}
exports.RecurrentOrderTemplateLineItemsHistoricalController = RecurrentOrderTemplateLineItemsHistoricalController;
//# sourceMappingURL=recurrentOrderTemplateLineItemsHistorical.controller.js.map