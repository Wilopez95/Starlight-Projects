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
exports.SurchargeItemController = void 0;
const SurchargeItem_1 = require("../../database/entities/tenant/SurchargeItem");
const SurchargeItemHistorical_1 = require("../../database/entities/tenant/SurchargeItemHistorical");
const base_controller_1 = require("../base.controller");
class SurchargeItemController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSurchargeItems(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, SurchargeItem_1.SurchargeItem);
        });
    }
    getSurchargeItemBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SurchargeItem_1.SurchargeItem);
        });
    }
    addSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SurchargeItem_1.SurchargeItem, SurchargeItemHistorical_1.SurchargeItemHistorical);
        });
    }
    bulkAddSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            bulkInsert: { get: () => super.bulkInsert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = body.data;
            return _super.bulkInsert.call(this, ctx, next, SurchargeItem_1.SurchargeItem, SurchargeItemHistorical_1.SurchargeItemHistorical);
        });
    }
    upsertSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.delete(SurchargeItem_1.SurchargeItem, {
                orderId: (_b = (_a = body === null || body === void 0 ? void 0 : body.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.surchargeId,
            });
            yield dataSource.destroy();
            return _super.insert.call(this, ctx, next, SurchargeItem_1.SurchargeItem, SurchargeItemHistorical_1.SurchargeItemHistorical);
        });
    }
    updateSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, SurchargeItem_1.SurchargeItem, SurchargeItemHistorical_1.SurchargeItemHistorical);
        });
    }
    deleteSurchargeItem(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SurchargeItem_1.SurchargeItem, SurchargeItemHistorical_1.SurchargeItemHistorical);
        });
    }
}
exports.SurchargeItemController = SurchargeItemController;
//# sourceMappingURL=surchargeItem.controller.js.map