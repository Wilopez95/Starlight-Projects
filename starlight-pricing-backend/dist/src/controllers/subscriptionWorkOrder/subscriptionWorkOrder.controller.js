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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionWorkOrderController = void 0;
const typeorm_1 = require("typeorm");
const base_controller_1 = require("../base.controller");
const SubscriptionWorkOrders_1 = require("../../database/entities/tenant/SubscriptionWorkOrders");
const SubscriptionWorkOrdersHistorical_1 = require("../../database/entities/tenant/SubscriptionWorkOrdersHistorical");
const SubscriptionWorkOrdersMedia_1 = require("../../database/entities/tenant/SubscriptionWorkOrdersMedia");
const SubscriptionWorkOrdersLineItems_1 = require("../../database/entities/tenant/SubscriptionWorkOrdersLineItems");
const SubscriptionOrders_1 = require("../../database/entities/tenant/SubscriptionOrders");
const httpStatusCodes_1 = require("../../consts/httpStatusCodes");
const workOrder_1 = require("../../consts/workOrder");
const validateStatusDate_1 = require("../../utils/validateStatusDate");
class SubscriptionWorkOrderController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionWorkOrders(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, SubscriptionWorkOrders_1.SubscriptionWorkOrders);
        });
    }
    getSubscriptionWorkOrdersBy(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const workOrders = yield dataSource.manager.find(SubscriptionWorkOrders_1.SubscriptionWorkOrders, {
                where: ctx.request.body,
            });
            const lineItems = yield dataSource.manager.find(SubscriptionWorkOrdersLineItems_1.SubscriptionWorkOrdersLineItems, {
                where: {
                    subscriptionWorkOrderId: (0, typeorm_1.In)(workOrders.map((wo) => wo.id)),
                },
            });
            const extendedWorkOrders = workOrders.map((swo) => {
                return Object.assign(Object.assign({}, swo), { lineItems: lineItems.filter((li) => li.subscriptionWorkOrderId == swo.id) });
            });
            ctx.body = extendedWorkOrders;
            ctx.status = 200;
            yield dataSource.destroy();
            return next();
        });
    }
    addSubscriptionWorkOrders(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionWorkOrders_1.SubscriptionWorkOrders, SubscriptionWorkOrdersHistorical_1.SubscriptionWorkOrdersHistorical);
        });
    }
    bulkaddSubscriptionWorkOrders(ctx, next) {
        const _super = Object.create(null, {
            bulkInserts: { get: () => super.bulkInserts }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.request.body.data;
            return _super.bulkInserts.call(this, ctx, next, SubscriptionWorkOrders_1.SubscriptionWorkOrders, SubscriptionWorkOrdersHistorical_1.SubscriptionWorkOrdersHistorical);
        });
    }
    getSequenceCount(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionId = ctx.request.body.id;
            let response = [];
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const countRecurrentOrders = yield dataSource
                .createQueryBuilder()
                .select("subscriptionOrders")
                .withDeleted()
                .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subscriptionOrders")
                .where(`subscriptionOrders.subscriptionOrderId = ${subscriptionId}`)
                .getCount();
            const sequenceId = yield dataSource
                .createQueryBuilder()
                .select("subscriptionOrders.sequenceId")
                .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionOrders")
                .where(`subscriptionOrders.id = ${subscriptionId}`)
                .getOne();
            yield dataSource.destroy();
            response = [countRecurrentOrders, sequenceId.sequenceId];
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    updateStatusBySubscriptionsOrdersIds(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionsOrdersIds, statuses, status } = ctx.request.body;
            let items;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const workOrders = yield dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders.id")
                .addSelect("subscriptionsOrders.status")
                .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subscriptionsOrders")
                .where({ subscriptionOrderId: (0, typeorm_1.In)(subscriptionsOrdersIds) })
                .andWhere({ status: (0, typeorm_1.In)(statuses) })
                .getMany();
            if (workOrders === null || workOrders === void 0 ? void 0 : workOrders.length) {
                const subscriptionWoIds = workOrders.map((item) => item.id);
                items = yield dataSource
                    .createQueryBuilder()
                    .update(SubscriptionWorkOrders_1.SubscriptionWorkOrders)
                    .set({ status: status })
                    .where({ id: (0, typeorm_1.In)(subscriptionWoIds) })
                    .execute();
                for (let index = 0; index < subscriptionWoIds.length; index++) {
                    let data = yield dataSource.manager.findOneBy(SubscriptionWorkOrders_1.SubscriptionWorkOrders, {
                        id: subscriptionWoIds[index],
                    });
                    let historical = Object.assign(Object.assign({}, data), base_controller_1.BaseController.historicalAttributes("edited", subscriptionWoIds[index], ctx));
                    yield dataSource.manager.insert(SubscriptionWorkOrdersHistorical_1.SubscriptionWorkOrdersHistorical, historical);
                }
            }
            yield dataSource.destroy();
            ctx.body = items ? items : [];
            ctx.status = 200;
            return next();
        });
    }
    softDeleteBy(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionIds, statuses } = ctx.request.body;
            let dataSourceSoft = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let qb = dataSourceSoft
                .createQueryBuilder()
                .select("subscriptionsOrders.id")
                .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subscriptionsOrders")
                .where({
                subscriptionOrderId: (0, typeorm_1.In)(subscriptionIds),
            });
            if (statuses === null || statuses === void 0 ? void 0 : statuses.length) {
                qb = qb.andWhere({ status: (0, typeorm_1.In)(statuses) });
            }
            const response = yield qb.getMany();
            yield dataSourceSoft.destroy();
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            if (response === null || response === void 0 ? void 0 : response.length) {
                for (let index = 0; index < response.length; index++) {
                    yield dataSource
                        .createQueryBuilder()
                        .softDelete()
                        .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subscriptionsWorkOrders")
                        .where({ id: response[index].id })
                        .execute();
                }
            }
            yield dataSource.destroy();
            ctx.body = response;
            ctx.status = 200;
        });
    }
    count(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionIds, hasComment, hasRoutes } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let qb = dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders.subscriptionOrderId")
                .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subscriptionsOrders")
                .where("subscriptionsOrders.subscriptionOrderId IN (:...subscriptionIds)", {
                subscriptionIds,
            })
                .andWhere({ deletedAt: (0, typeorm_1.IsNull)() })
                .groupBy("subscriptionsOrders.subscriptionOrderId");
            if (hasComment) {
                qb = qb.andWhere({ commentFromDriver: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) }).andWhere({ commentFromDriver: (0, typeorm_1.Not)("") });
            }
            if (hasRoutes) {
                qb = qb.andWhere({ assignedRoute: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) }).andWhere({ assignedRoute: (0, typeorm_1.Not)("") });
            }
            const response = yield qb.getCount();
            yield dataSource.destroy();
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    countStatus(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionIds, status } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let response = yield dataSource
                .createQueryBuilder()
                .select(`COUNT(subscriptionsOrders.id) AS ${status}`)
                .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subscriptionsOrders")
                .where("subscriptionsOrders.subscriptionOrderId IN (:...subscriptionIds)", {
                subscriptionIds,
            })
                .andWhere({ deletedAt: (0, typeorm_1.IsNull)() })
                .andWhere({ status: status })
                .groupBy("subscriptionsOrders.subscriptionOrderId")
                .getCount();
            yield dataSource.destroy();
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    countJoin(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionIds, subscriptionMedia, subscriptionLine } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let qb = dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders.subscriptionOrderId")
                .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subscriptionsOrders")
                .where("subscriptionsOrders.subscriptionOrderId IN (:...subscriptionIds)", {
                subscriptionIds,
            })
                .andWhere({ deletedAt: (0, typeorm_1.IsNull)() })
                .groupBy("subscriptionsOrders.subscriptionOrderId");
            if (subscriptionMedia) {
                qb = qb
                    .addSelect("distinct(subscriptionWoMediaT.id)")
                    .leftJoin(SubscriptionWorkOrdersMedia_1.SubscriptionWorkOrdersMedia, "subscriptionWoMediaT", "subscriptionWoMediaT.subscriptionWorkOrderId = subscriptionsOrders.id")
                    .andWhere("subscriptionWoMediaT.id IS NOT NULL");
            }
            if (subscriptionLine) {
                qb = qb
                    .addSelect("distinct(subscriptionWoLineItemT.id)")
                    .leftJoin(SubscriptionWorkOrdersLineItems_1.SubscriptionWorkOrdersLineItems, "subscriptionWoLineItemT", "subscriptionWoLineItemT.subscriptionWorkOrderId = subscriptionsOrders.id")
                    .andWhere("subscriptionWoLineItemT.id IS NOT NULL");
            }
            const response = yield qb.getCount();
            yield dataSource.destroy();
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    getSubscriptionByStatus(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionIds, columnName, orderBy, condition, statuses } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let qb = dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders")
                .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subscriptionsOrders")
                .where("subscriptionsOrders.subscriptionOrderId IN (:...subscriptionIds)", {
                subscriptionIds,
            })
                .andWhere({ deletedAt: (0, typeorm_1.IsNull)() })
                .groupBy("subscriptionsOrders.id")
                .orderBy(columnName, orderBy)
                .limit(1);
            if (condition === "=") {
                qb = qb.andWhere({ status: statuses });
            }
            if (condition === "in") {
                qb = qb.andWhere({ status: (0, typeorm_1.In)(statuses) });
            }
            if (condition === "not in") {
                qb = qb.andWhere({ status: (0, typeorm_1.Not)((0, typeorm_1.In)(statuses)) });
            }
            const response = yield qb.getRawOne();
            yield dataSource.destroy();
            ctx.body = response || 0;
            ctx.status = 200;
            return next();
        });
    }
    deleteSubscriptionWorkOrders(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SubscriptionWorkOrders_1.SubscriptionWorkOrders);
        });
    }
    updateStatus(ctx, next) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionOrderId } = ctx.request.body;
            if (!subscriptionOrderId) {
                ctx.status = httpStatusCodes_1.default.BAD_REQUEST;
                return next();
            }
            const filters = {
                status: (0, typeorm_1.In)([workOrder_1.SUBSCRIPTION_WO_STATUS.scheduled, workOrder_1.SUBSCRIPTION_WO_STATUS.inProgress]),
                subscriptionOrderId,
            };
            ctx.request.body.where = filters;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const items = yield dataSource
                .createQueryBuilder()
                .update(SubscriptionWorkOrders_1.SubscriptionWorkOrders)
                .set({ status: ctx.request.body.status })
                .where(filters)
                .select("*")
                .execute();
            try {
                for (var items_1 = __asyncValues(items), items_1_1; items_1_1 = yield items_1.next(), !items_1_1.done;) {
                    const item = items_1_1.value;
                    let historical = Object.assign(Object.assign({}, item), base_controller_1.BaseController.historicalAttributes("edited", item.id, ctx));
                    yield dataSource.manager.insert(SubscriptionWorkOrdersHistorical_1.SubscriptionWorkOrdersHistorical, historical);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (items_1_1 && !items_1_1.done && (_a = items_1.return)) yield _a.call(items_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            yield dataSource.destroy();
            ctx.body = items;
            ctx.status = httpStatusCodes_1.default.OK;
            return next();
        });
    }
    updateSubscriptionWorkOrder(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = (0, validateStatusDate_1.validateStatusDate)(ctx.request.body.status, ctx.request.body);
            return _super.update.call(this, ctx, next, SubscriptionWorkOrders_1.SubscriptionWorkOrders, SubscriptionWorkOrdersHistorical_1.SubscriptionWorkOrdersHistorical);
        });
    }
    updateManySubscriptionWorkOrder(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const items = yield dataSource.createQueryBuilder().update(SubscriptionWorkOrders_1.SubscriptionWorkOrders).set(data).execute();
            items.generatedMaps.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                let data = yield dataSource.manager.findOneBy(SubscriptionWorkOrders_1.SubscriptionWorkOrders, {
                    id: item.id,
                });
                let historical = Object.assign(Object.assign({}, data), base_controller_1.BaseController.historicalAttributes("edited", item.id, ctx));
                yield dataSource.manager.insert(SubscriptionWorkOrdersHistorical_1.SubscriptionWorkOrdersHistorical, historical);
            }));
            yield dataSource.destroy();
            ctx.body = items;
            ctx.status = 200;
            return next();
        });
    }
}
exports.SubscriptionWorkOrderController = SubscriptionWorkOrderController;
//# sourceMappingURL=subscriptionWorkOrder.controller.js.map