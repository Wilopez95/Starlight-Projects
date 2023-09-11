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
exports.ThresholdItemsController = void 0;
const calcPriceToDisplay_1 = require("../../utils/calcPriceToDisplay");
const ThresholdItems_1 = require("../../database/entities/tenant/ThresholdItems");
const ThresholdItemsHistorical_1 = require("../../database/entities/tenant/ThresholdItemsHistorical");
const base_controller_1 = require("../base.controller");
class ThresholdItemsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getThresholdItems(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, ThresholdItems_1.ThresholdItems);
        });
    }
    getThresholdItemBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, ThresholdItems_1.ThresholdItems);
        });
    }
    addThresholdItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = (0, calcPriceToDisplay_1.calcPriceToDisplay)(body);
            return _super.insert.call(this, ctx, next, ThresholdItems_1.ThresholdItems, ThresholdItemsHistorical_1.ThresholdItemsHistorical);
        });
    }
    upsertThresholdItems(ctx, next) {
        const _super = Object.create(null, {
            insertMany: { get: () => super.insertMany }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = body.data;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            if (Array.isArray(ctx.request.body)) {
                yield dataSource.manager.delete(ThresholdItems_1.ThresholdItems, {
                    orderId: ctx.request.body[0].orderId,
                });
                ctx.request.body = ctx.request.body.map((item) => {
                    item = (0, calcPriceToDisplay_1.calcPriceToDisplay)(item);
                    return item;
                });
                yield dataSource.destroy();
                return _super.insertMany.call(this, ctx, next, ThresholdItems_1.ThresholdItems, ThresholdItemsHistorical_1.ThresholdItemsHistorical);
            }
            else {
                yield dataSource.manager.delete(ThresholdItems_1.ThresholdItems, {
                    orderId: ctx.request.body,
                });
                yield dataSource.destroy();
                ctx.body = [];
                ctx.status = 200;
                return next();
            }
        });
    }
    bulkAddThresholdItems(ctx, next) {
        const _super = Object.create(null, {
            bulkInsert: { get: () => super.bulkInsert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = body.data;
            return _super.bulkInsert.call(this, ctx, next, ThresholdItems_1.ThresholdItems, ThresholdItemsHistorical_1.ThresholdItemsHistorical);
        });
    }
    updateThresholdItems(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, ThresholdItems_1.ThresholdItems, ThresholdItemsHistorical_1.ThresholdItemsHistorical);
        });
    }
    deleteThresholdItems(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, ThresholdItems_1.ThresholdItems, ThresholdItemsHistorical_1.ThresholdItemsHistorical);
        });
    }
}
exports.ThresholdItemsController = ThresholdItemsController;
//# sourceMappingURL=thresholdItems.controller.js.map