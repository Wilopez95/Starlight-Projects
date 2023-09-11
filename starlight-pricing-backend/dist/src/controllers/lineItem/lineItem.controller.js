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
exports.LineItemsController = void 0;
const LineItems_1 = require("../../database/entities/tenant/LineItems");
const base_controller_1 = require("../base.controller");
class LineItemsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getLineItems(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, LineItems_1.LineItems);
        });
    }
    getLineItemsBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, LineItems_1.LineItems);
        });
    }
    addLineItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, LineItems_1.LineItems);
        });
    }
    bulkAddLineItems(ctx, next) {
        const _super = Object.create(null, {
            bulkInsert: { get: () => super.bulkInsert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = body.data.map((item) => {
                if (item.customRatesGroupLineItemsId) {
                    return Object.assign(Object.assign({}, item), { globalRatesLineItemsId: null });
                }
                else {
                    return item;
                }
            });
            return _super.bulkInsert.call(this, ctx, next, LineItems_1.LineItems);
        });
    }
    upsertLineItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = body.data;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            if (Array.isArray(ctx.request.body)) {
                yield dataSource.manager.delete(LineItems_1.LineItems, {
                    orderId: ctx.request.body[0].orderId,
                });
                ctx.request.body.map((item) => {
                    delete item.priceToDisplay;
                    return item;
                });
                yield dataSource.destroy();
                return _super.insert.call(this, ctx, next, LineItems_1.LineItems);
            }
            else {
                yield dataSource.manager.delete(LineItems_1.LineItems, {
                    orderId: ctx.request.body,
                });
                ctx.body = "OK";
                ctx.status = 200;
                yield dataSource.destroy();
                return next();
            }
        });
    }
    updateLineItems(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.update.call(this, ctx, next, LineItems_1.LineItems);
        });
    }
    deleteLineItems(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, LineItems_1.LineItems);
        });
    }
}
exports.LineItemsController = LineItemsController;
//# sourceMappingURL=lineItem.controller.js.map