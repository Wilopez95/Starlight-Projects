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
exports.SubscriptionOrdersController = void 0;
const typeorm_1 = require("typeorm");
const Subscriptions_1 = require("../../database/entities/tenant/Subscriptions");
const SubscriptionOrders_1 = require("../../database/entities/tenant/SubscriptionOrders");
const base_controller_1 = require("../base.controller");
const haulingRequest_1 = require("../../request/haulingRequest");
const SubscriptionServiceItem_1 = require("../../database/entities/tenant/SubscriptionServiceItem");
const SubscriptionLineItem_1 = require("../../database/entities/tenant/SubscriptionLineItem");
const subscriptionOrderConditions_1 = require("../../utils/subscriptionOrderConditions");
const typeorm_2 = require("typeorm");
const SubscriptionOrdersHistorical_1 = require("../../database/entities/tenant/SubscriptionOrdersHistorical");
const orderStatuses_1 = require("../../consts/orderStatuses");
const lodash_1 = require("lodash");
const validateStatusDate_1 = require("../../utils/validateStatusDate");
const SubscriptionOrdersLineItems_1 = require("../../database/entities/tenant/SubscriptionOrdersLineItems");
const SubscriptionOrdersMedia_1 = require("../../database/entities/tenant/SubscriptionOrdersMedia");
/**
 * Extendeds Subscription Order with external data.
 * @param ctx Koa Context.
 * @param so Subscription Order.
 * @returns An extended Subscription Order.
 */
const extendSubscriptionOrder = (ctx, so) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get Subscription linked to the Order
    let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
    const subscription = yield dataSource.getRepository(Subscriptions_1.Subscriptions).findOneBy({
        id: so.subscriptionId,
    });
    const mediaFiles = yield dataSource.getRepository(SubscriptionOrdersMedia_1.SubscriptionOrderMedia).findBy({
        subscriptionId: so.subscriptionId,
    });
    // Get Subscription Service Items linked to the Subscription
    const subscriptionServiceItem = yield dataSource.getRepository(SubscriptionServiceItem_1.SubscriptionServiceItem).findOneBy({ subscriptionId: so.subscriptionId });
    // Get Subscription Line Items linked to the Subscription Service
    //const subscriptionLineItems = await dataSource
    //  .getRepository(SubscriptionLineItem)
    //  .findBy({ subscriptionServiceItemId: subscriptionServiceItem.id });
    // Get Subscription order Line Items linked to the Subscription order (non-service order)
    const subscriptionOrderLineItems = yield dataSource.getRepository(SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems).findBy({ subscriptionOrderId: so.id });
    yield dataSource.destroy();
    const extendedSubscriptionLineItems2 = yield Promise.all(subscriptionOrderLineItems.map((sli) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, haulingRequest_1.getOrderData)(ctx, {
            data: {
                billableLineItemId: sli.billableLineItemId,
            },
        });
        return Object.assign(Object.assign({}, sli), { historicalLineItem: response.billableLineItem });
    })));
    // Get Hauling Data necesary to make the response
    let externalData = yield (0, haulingRequest_1.getOrderData)(ctx, {
        data: {
            jobSiteId: subscription.jobSiteId,
            customerId_Histo: subscription.customerId,
            businessLineId: subscription.businessLineId,
            businessUnitId: subscription.businessUnitId,
            serviceAreaId: subscription.serviceAreaId,
            billableServiceId: so.billableServiceId,
            orderContactId: subscription.subscriptionContactId,
            materialId: subscriptionServiceItem.materialId,
            purchaseOrderId: so.purchaseOrderId,
            thirdPartyHaulerId: so.thirdPartyHaulerId,
        },
    });
    return Object.assign(Object.assign({}, so), { jobSite: externalData.jobSite, businessUnit: externalData.businessUnit, businessLine: externalData.businessLine, customer: externalData.customer, lineItems: extendedSubscriptionLineItems2 !== null && extendedSubscriptionLineItems2 !== void 0 ? extendedSubscriptionLineItems2 : [], billableService: externalData.billableService, subscriptionServiceItem: subscriptionServiceItem ? Object.assign(Object.assign({}, subscriptionServiceItem), { material: externalData.material }) : null, subscriptionContact: externalData.orderContact, billableLineItemsTotal: subscriptionOrderLineItems.reduce((val, sli) => sli.price * sli.quantity + val, 0), purchaseOrder: externalData.purchaseOrder, thirdPartyHaulerDescription: (_a = externalData.thirdPartyHauler) === null || _a === void 0 ? void 0 : _a.description, mediaFiles: mediaFiles });
});
var SubscriptionSortBy;
(function (SubscriptionSortBy) {
    SubscriptionSortBy["id"] = "id";
    SubscriptionSortBy["serviceDate"] = "serviceDate";
    SubscriptionSortBy["jobSite"] = "jobSite";
    SubscriptionSortBy["status"] = "status";
})(SubscriptionSortBy || (SubscriptionSortBy = {}));
class SubscriptionOrdersController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionOrders(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, sortBy, sortOrder, businessUnitId, status, query } = ctx.request.query;
            const { ids } = ctx.request.body;
            // The following sort fields prefixes must match with bellow query builder entity aliases.
            // Unlike <<limit>> TypeORM function, <<take>> function work with query builder aliases instead of raw table names.
            const buildSortBy = (sortBy = "") => {
                switch (sortBy) {
                    case SubscriptionSortBy.id:
                        return "subscriptionsOrders.sequenceId";
                    case SubscriptionSortBy.jobSite:
                        return "subscription.jobSiteId";
                    case SubscriptionSortBy.serviceDate:
                        return "subscriptionsOrders.serviceDate";
                    case SubscriptionSortBy.status:
                        return "subscriptionsOrders.status";
                    default:
                        return "";
                }
            };
            let paramLimit = 25;
            let paramSkip = 0;
            let paramSortBy = buildSortBy(sortBy);
            let paramSortOrder = "";
            let paramStatus = "";
            let paramsIds = {};
            if (limit) {
                paramLimit = +limit;
            }
            if (skip) {
                paramSkip = +skip;
            }
            if (sortOrder) {
                paramSortOrder = sortOrder;
            }
            if (status) {
                if (status.toString() === "FINALIZED") {
                    paramStatus = { status: (0, typeorm_2.In)(["FINALIZED", "CANCELED"]) };
                }
                else {
                    paramStatus = { status: status.toString().toUpperCase() };
                }
            }
            if (!(0, lodash_1.isEmpty)(ids)) {
                paramsIds = { id: (0, typeorm_2.In)(ids) };
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let queryBuilder = dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders")
                .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionsOrders")
                .innerJoinAndMapOne("subscriptionsOrders.subscription", "Subscriptions", "subscription", `subscriptionsOrders.subscriptionId = subscription.id and subscription.businessUnitId = ${businessUnitId}`)
                .leftJoinAndMapOne("subscriptionsOrders.subscriptionServiceItem", "SubscriptionServiceItem", "serviceItem", "serviceItem.subscriptionId = subscriptionsOrders.subscriptionId")
                .leftJoinAndMapMany("subscriptionsOrders.lineItems", "SubscriptionOrdersLineItems", "subscriptionLineItem", "subscriptionsOrders.id = subscriptionLineItem.subscriptionOrderId")
                .where(Object.assign(Object.assign({}, paramStatus), paramsIds))
                .andWhere(`subscription.businessUnitId = ${businessUnitId}`);
            if (query) {
                queryBuilder = queryBuilder.andWhere("subscriptionsOrders.sequenceId LIKE :query", { query: `%${query}%` });
            }
            queryBuilder = queryBuilder.skip(paramSkip).take(paramLimit).orderBy(paramSortBy, paramSortOrder.toUpperCase());
            const subscriptionOrders = yield queryBuilder.getMany();
            yield dataSource.destroy();
            const getExtendedDataRecursive = (edges, index = 0, nextEdges = []) => __awaiter(this, void 0, void 0, function* () {
                if (!edges[index]) {
                    return nextEdges;
                }
                const so = edges[index];
                const haulingRequestBody = {
                    jobSiteId: so.subscription.jobSiteId,
                    customerId_Histo: so.subscription.customerId,
                    businessLineId: so.subscription.businessLineId,
                    businessUnitId: so.subscription.businessUnitId,
                    billableServiceId: so.billableServiceId,
                };
                const haulingResponse = yield (0, haulingRequest_1.getOrderData)(ctx, { data: haulingRequestBody });
                so.jobSite = haulingResponse.jobSite;
                so.businessUnit = haulingResponse.businessUnit;
                so.businessLine = haulingResponse.businessLine;
                so.customer = haulingResponse.customer;
                so.billableService = haulingResponse.billableService;
                nextEdges.push(so);
                const nextIndex = index + 1;
                if (edges[nextIndex]) {
                    return getExtendedDataRecursive(edges, nextIndex, nextEdges);
                }
                return nextEdges;
            });
            const extendedSubscriptionOrders = yield getExtendedDataRecursive(subscriptionOrders);
            ctx.body = extendedSubscriptionOrders;
            ctx.status = 200;
        });
    }
    validateOrders(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ids, businessUnitId, status } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let subscriptionOrdersData = yield dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders")
                .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionsOrders")
                .leftJoinAndMapOne("subscriptionsOrders.subscription", "Subscriptions", "subscription", "subscriptionsOrders.subscriptionId = subscription.id")
                .leftJoinAndMapOne("subscriptionsOrders.SubscriptionWorkOrder", "SubscriptionWorkOrders", "SubWO", "SubWO.subscriptionOrderId = subscriptionsOrders.id")
                .where({ status, completedAt: (0, typeorm_1.IsNull)(), id: (0, typeorm_2.In)(ids) })
                .andWhere(`subscription.businessUnitId = ${businessUnitId}`)
                .andWhere(`SubWO.truckNumber IS NULL AND SubWO.completedAt IS NULL AND SubWO.assignedRoute IS NULL`)
                .getMany();
            yield dataSource.destroy();
            ctx.body = subscriptionOrdersData || [];
            ctx.status = 200;
        });
    }
    getSubscriptionOrdersBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SubscriptionOrders_1.SubscriptionOrders);
        });
    }
    addSubscriptionOrders(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionOrders_1.SubscriptionOrders, SubscriptionOrdersHistorical_1.SubscriptionOrdersHistorical);
        });
    }
    bulkaddSubscriptionOrders(ctx, next) {
        const _super = Object.create(null, {
            bulkInserts: { get: () => super.bulkInserts }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = body.data;
            return _super.bulkInserts.call(this, ctx, next, SubscriptionOrders_1.SubscriptionOrders, SubscriptionOrdersHistorical_1.SubscriptionOrdersHistorical);
        });
    }
    updateSubscriptionOrders(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            ctx.request.body = (0, validateStatusDate_1.validateStatusDate)(body.status, body);
            return _super.update.call(this, ctx, next, SubscriptionOrders_1.SubscriptionOrders, SubscriptionOrdersHistorical_1.SubscriptionOrdersHistorical);
        });
    }
    updateSubscriptionOrdersBySubsId(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            let subscriptionId = +ctx.request.url.split("/")[4];
            ctx.request.body = (0, validateStatusDate_1.validateStatusDate)(body.status, body);
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.update(SubscriptionOrders_1.SubscriptionOrders, { subscriptionId: subscriptionId }, ctx.request.body);
            let data = yield dataSource.manager.findOneBy(SubscriptionOrders_1.SubscriptionOrders, { subscriptionId: subscriptionId });
            yield dataSource.destroy();
            ctx.body = data;
            return next();
        });
    }
    deleteSubscriptionOrders(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SubscriptionOrders_1.SubscriptionOrders, SubscriptionOrdersHistorical_1.SubscriptionOrdersHistorical);
        });
    }
    getSequenceCount(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            const subscriptionId = body.id;
            let response = 0;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const countRecurrentOrders = yield dataSource
                .createQueryBuilder()
                .select("subscriptionOrders")
                .withDeleted()
                .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionOrders")
                .where(`subscriptionOrders.subscriptionId = ${subscriptionId}`)
                .getCount();
            yield dataSource.destroy();
            response = countRecurrentOrders;
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    getSubscriptionOrdersPaginated(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let subscriptionId = +ctx.request.url.split("/")[4];
            // Get Subscription Orders
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let subscriptionOrdersData = yield dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders")
                .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionsOrders")
                .where({ subscriptionId: subscriptionId })
                .getMany();
            // Get Subscription linked to the Order
            let subscriptionData = yield dataSource
                .createQueryBuilder()
                .select("subscriptions")
                .from(Subscriptions_1.Subscriptions, "subscriptions")
                .where({ id: subscriptionId })
                .getOne();
            // Get Subscription Service Items linked to the Subscription
            const subscriptionServiceItem = yield dataSource
                .createQueryBuilder()
                .select("subsServiceItem")
                .from(SubscriptionServiceItem_1.SubscriptionServiceItem, "subsServiceItem")
                .where(`subsServiceItem.subscriptionId = ${subscriptionId}`)
                .getOne();
            // Get Subscription Line Items linked to the Subscription Service
            let subscriptionLineItems = yield dataSource
                .createQueryBuilder()
                .select("subscriptionLineItem")
                .from(SubscriptionLineItem_1.SubscriptionLineItem, "subscriptionLineItem")
                .where({ subscriptionServiceItemId: subscriptionServiceItem.id })
                .getMany();
            yield dataSource.destroy();
            // Get Hauling Data necesary to make the response
            let haulingRequestRequestbody = {
                jobSiteId: subscriptionData.jobSiteId,
                customerId: subscriptionData.customerId,
                businessLineId: subscriptionData.businessLineId,
                businessUnitId: subscriptionData.businessUnitId,
                serviceAreaId: subscriptionData.serviceAreaId,
                billableServiceId: subscriptionOrdersData.billableServiceId,
            };
            const haulingData = yield (0, haulingRequest_1.getOrderData)(ctx, {
                data: haulingRequestRequestbody,
            });
            for (let index = 0; index < subscriptionOrdersData.length; index++) {
                const subscriptionOrder = subscriptionOrdersData[index];
                let haulingRequestBillable = {
                    billableServiceId: subscriptionOrder.billableServiceId,
                };
                const haulingDataBillable = yield (0, haulingRequest_1.getOrderData)(ctx, {
                    data: haulingRequestBillable,
                });
                subscriptionOrder.jobSite = haulingData.jobSite;
                subscriptionOrder.businessUnit = haulingData.businessUnit;
                subscriptionOrder.businessLine = haulingData.businessLine;
                subscriptionOrder.customer = haulingData.customer;
                subscriptionOrder.lineItems = subscriptionLineItems ? subscriptionLineItems : [];
                subscriptionOrder.billableService = haulingDataBillable.billableService;
                subscriptionOrder.subscriptionServiceItem = subscriptionServiceItem ? subscriptionServiceItem : null;
                subscriptionOrdersData[index] = subscriptionOrder;
            }
            let response = subscriptionOrdersData;
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    getBySubscriptionIds(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionIds, statuses, subscriptionServiceItemsIds, tupleConditions, types, excludeTypes } = ctx.request.body;
            const preparedTupleConditions = (0, subscriptionOrderConditions_1.unambiguousTupleCondition)("subscriptionsOrders", tupleConditions);
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let qb = dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders")
                .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionsOrders")
                .innerJoinAndMapMany("subscriptionsOrders.subscriptionServiceItem", "SubscriptionServiceItem", "serviceItem", "serviceItem.id = subscriptionsOrders.subscriptionServiceItemId")
                .where("serviceItem.subscriptionId IN (:...subscriptionIds)", {
                subscriptionIds,
            })
                .andWhere("subscriptionsOrders.deletedAt IS NULL")
                .andWhere("subscriptionsOrders.oneTime = false");
            if (statuses === null || statuses === void 0 ? void 0 : statuses.length) {
                qb = qb.andWhere("subscriptionsOrders.status IN (:...statuses)", {
                    statuses,
                });
            }
            if (subscriptionServiceItemsIds === null || subscriptionServiceItemsIds === void 0 ? void 0 : subscriptionServiceItemsIds.length) {
                qb = qb.andWhere("subscriptionsOrders.subscriptionServiceItemId IN (:...subscriptionServiceItemsIds)", {
                    subscriptionServiceItemsIds,
                });
            }
            preparedTupleConditions === null || preparedTupleConditions === void 0 ? void 0 : preparedTupleConditions.forEach((tupleCondition) => {
                qb = qb.andWhere(...tupleCondition);
            });
            const response = yield qb.getMany();
            if (response === null || response === void 0 ? void 0 : response.length) {
                for (let index = 0; index < response.length; index++) {
                    let billableRequest = {
                        id: response[index].billableServiceId,
                        types: types,
                        excludeTypes: excludeTypes,
                    };
                    const haulingBillableService = yield (0, haulingRequest_1.getBillableServiceBySubscription)(ctx, {
                        data: billableRequest,
                    });
                    response[index].billableService = haulingBillableService.billableService;
                }
            }
            yield dataSource.destroy();
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    getById(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionOrderId = Number.parseInt(ctx.params.id);
            if (Number.isNaN(subscriptionOrderId)) {
                return next();
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const subscriptionOrder = yield dataSource
                .getRepository(SubscriptionOrders_1.SubscriptionOrders)
                .createQueryBuilder("so")
                .where("so.id = :id", { id: subscriptionOrderId })
                .getOne();
            yield dataSource.destroy();
            ctx.body = yield extendSubscriptionOrder(ctx, subscriptionOrder);
            ctx.status = 200;
            return next();
        });
    }
    getAllByIds(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Ids } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const response = yield dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders")
                .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionsOrders")
                .where({ id: (0, typeorm_2.In)(Ids) })
                .getMany();
            yield dataSource.destroy();
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    softDeleteBy(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionIds, statuses } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let qb = dataSource
                .createQueryBuilder()
                .select("subscriptionsOrders")
                .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionsOrders")
                .where({
                id: (0, typeorm_2.In)(subscriptionIds),
            })
                .andWhere({ deletedAt: (0, typeorm_1.IsNull)() });
            if (statuses === null || statuses === void 0 ? void 0 : statuses.length) {
                qb = qb.andWhere({ status: (0, typeorm_2.In)(statuses) });
            }
            const response = yield qb.getMany();
            yield dataSource.destroy();
            let dataSource2 = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            if (response === null || response === void 0 ? void 0 : response.length) {
                for (let index = 0; index < response.length; index++) {
                    yield dataSource2
                        .createQueryBuilder()
                        .softDelete()
                        .from(SubscriptionOrders_1.SubscriptionOrders, "subscriptionsOrders")
                        .where({ id: response[index].id })
                        .execute();
                }
            }
            yield dataSource2.destroy();
            ctx.body = response;
            ctx.status = 200;
        });
    }
    updateStatusByIds(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { ids, data } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource
                .createQueryBuilder()
                .update(SubscriptionOrders_1.SubscriptionOrders)
                .set(data)
                .where({ id: (0, typeorm_2.In)(ids) })
                .execute();
            let items = [];
            for (let index = 0; index < ids.length; index++) {
                let data = yield dataSource.manager.findOneBy(SubscriptionOrders_1.SubscriptionOrders, {
                    id: ids[index],
                });
                items.push(data);
                let historical = Object.assign(Object.assign({}, data), base_controller_1.BaseController.historicalAttributes("edited", ids[index], ctx));
                yield dataSource.manager.insert(SubscriptionOrdersHistorical_1.SubscriptionOrdersHistorical, historical);
            }
            yield dataSource.destroy();
            ctx.body = items;
            ctx.status = 200;
            return next();
        });
    }
    getSubscriptionOrdersCount(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { businessUnitId } = ctx.request.body;
            const dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let query = dataSource
                .createQueryBuilder()
                .select("so.status AS status")
                .addSelect("COUNT(so.status) AS count")
                .groupBy("so.status")
                .from(SubscriptionOrders_1.SubscriptionOrders, "so")
                .innerJoin(Subscriptions_1.Subscriptions, "s", "so.subscriptionId = s.id")
                .where("s.businessUnitId = :businessUnitId", {
                businessUnitId: Number(businessUnitId),
            });
            const result = yield query.execute();
            yield dataSource.destroy();
            const summary = {
                total: 0,
                statuses: {
                    SCHEDULED: 0,
                    IN_PROGRESS: 0,
                    BLOCKED: 0,
                    SKIPPED: 0,
                    COMPLETED: 0,
                    APPROVED: 0,
                    CANCELED: 0,
                    FINALIZED: 0,
                    INVOICED: 0,
                    NEEDS_APPROVAL: 0,
                },
            };
            summary.total = result.map((s) => Number(s.count)).reduce((t, v) => t + v, 0);
            result.map((s) => (summary.statuses[s.status] = Number(s.count)));
            ctx.body = summary;
            ctx.status = 200;
        });
    }
    getNextServiceDateBySubscriptionId(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionId = Number.parseInt(ctx.params.id);
            if (Number.isNaN(subscriptionId)) {
                return next();
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const subscriptionOrder = yield dataSource
                .getRepository(SubscriptionOrders_1.SubscriptionOrders)
                .createQueryBuilder("so")
                .where({ subscriptionId: subscriptionId })
                .andWhere("so.status <> :status", {
                status: orderStatuses_1.SUBSCRIPTION_ORDER_STATUS.canceled,
            })
                .andWhere("so.serviceDate >= :serviceDate", {
                serviceDate: new Date().toISOString(),
            })
                .orderBy("so.serviceDate", "ASC")
                .getOne();
            yield dataSource.destroy();
            ctx.body = subscriptionOrder;
            ctx.status = 200;
            return next();
        });
    }
}
exports.SubscriptionOrdersController = SubscriptionOrdersController;
//# sourceMappingURL=subscriptionOrders.controller.js.map