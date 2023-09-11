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
exports.RecurrentOrderTemplateLineItemsController = void 0;
const typeorm_1 = require("typeorm");
const RecurrentOrderTemplateLineItems_1 = require("../../database/entities/tenant/RecurrentOrderTemplateLineItems");
const RecurrentOrderTemplateLineItemsHistorical_1 = require("../../database/entities/tenant/RecurrentOrderTemplateLineItemsHistorical");
const base_controller_1 = require("../base.controller");
class RecurrentOrderTemplateLineItemsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    upsertOrderTemplateLineItem(ctx, next) {
        const _super = Object.create(null, {
            bulkInsert: { get: () => super.bulkInsert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const id = ctx.request.body.id;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const lineItemsIds = yield dataSource.createQueryBuilder()
                .select("recurrentOrderTemplateLineItems.id")
                .from(RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems, "recurrentOrderTemplateLineItems")
                .where(`recurrentOrderTemplateLineItems.recurrentOrderTemplateId = ${id}`)
                .getMany();
            if (lineItemsIds.length > 0) {
                const ids = lineItemsIds.map((item) => item.id);
                dataSource.manager.delete(RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems, {
                    id: (0, typeorm_1.In)(ids),
                });
            }
            yield dataSource.destroy();
            ctx.request.body = ctx.request.body.data;
            return _super.bulkInsert.call(this, ctx, next, RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems);
        });
    }
    getRecurrentOrderTemplateLineItems(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems);
        });
    }
    getRecurrentOrderTemplateLineItemsBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems);
        });
    }
    addRecurrentOrderTemplateLineItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
    bulkaddRecurrentOrderTemplateLineItems(ctx, next) {
        const _super = Object.create(null, {
            bulkInsert: { get: () => super.bulkInsert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.request.body.data;
            return _super.bulkInsert.call(this, ctx, next, RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
    updateRecurrentOrderTemplateLineItems(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            //const input: RecurrentOrderTemplateLineItems = ctx.request.body;
            return _super.update.call(this, ctx, next, RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
    deleteRecurrentOrderTemplateLineItems(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems, RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
        });
    }
}
exports.RecurrentOrderTemplateLineItemsController = RecurrentOrderTemplateLineItemsController;
//# sourceMappingURL=recurrentOrderTemplateLineItems.controller.js.map