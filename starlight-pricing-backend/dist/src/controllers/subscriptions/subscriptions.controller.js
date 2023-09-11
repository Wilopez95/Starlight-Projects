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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const SubscriptionsHistorical_1 = require("../../database/entities/tenant/SubscriptionsHistorical");
const Subscriptions_1 = require("../../database/entities/tenant/Subscriptions");
const SubscriptionOrders_1 = require("../../database/entities/tenant/SubscriptionOrders");
const base_controller_1 = require("../base.controller");
const haulingRequest_1 = require("./../../request/haulingRequest");
const subscriptionServiceName_1 = require("../../utils/subscriptionServiceName");
const SubscriptionServiceItem_1 = require("../../database/entities/tenant/SubscriptionServiceItem");
const date_fns_1 = require("date-fns");
const typeorm_1 = require("typeorm");
const sortOrders_1 = require("../../consts/sortOrders");
const elasticSearch_1 = require("../../services/elasticSearch/elasticSearch");
const searchIndices_1 = require("../../consts/searchIndices");
const subscriptionAttributes_1 = require("../../consts/subscriptionAttributes");
const repository_1 = require("../../Repository/subscriptions/repository");
const httpStatusCodes_1 = require("../../consts/httpStatusCodes");
const search_1 = require("../../utils/search");
const mustFilterES_1 = require("../../utils/mustFilterES");
const subscriptions_1 = require("../../services/elasticSearch/subscriptions");
const hauling_1 = require("../../services/hauling");
class SubscriptionsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptions(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, Subscriptions_1.Subscriptions);
        });
    }
    getSubscriptionsBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, Subscriptions_1.Subscriptions);
        });
    }
    addSubscriptions(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, Subscriptions_1.Subscriptions, SubscriptionsHistorical_1.SubscriptionsHistorical);
        });
    }
    updateSubscriptions(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            let id = +ctx.request.url.split("/")[4] || body.subscriptionId;
            return _super.update.call(this, ctx, next, Subscriptions_1.Subscriptions, SubscriptionsHistorical_1.SubscriptionsHistorical, id);
        });
    }
    deleteSubscriptions(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.query;
            return _super.delete.call(this, ctx, next, Subscriptions_1.Subscriptions);
        });
    }
    getSubscription(ctx, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            const subscriptionId = body.id;
            const customerId = body.customerId;
            let whereFilter = { id: subscriptionId };
            if (customerId) {
                whereFilter.customerId = customerId;
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let datas = yield dataSource.manager
                .createQueryBuilder()
                .select("subscription")
                .from(Subscriptions_1.Subscriptions, "subscription")
                .where(whereFilter)
                .getOne();
            yield dataSource.destroy();
            let data = datas;
            if (data) {
                let haulingRequestRequestbody = {
                    jobSiteId: data.jobSiteId,
                    customerId_Histo: data.customerId,
                    businessLineId: data.businessLineId,
                    businessUnitId: data.businessUnitId,
                    billableServiceId: data.billableServiceId,
                    jobSiteContactId: data.jobSiteContactId,
                    orderContactId: data.subscriptionContactId,
                    purchaseOrderId: data.purchaseOrderId,
                    customerJobSiteId: data.customerJobSiteId,
                    thirdPartyHaulerId: data.thirdPartyHaulerId,
                };
                if (datas.status === "draft") {
                    haulingRequestRequestbody.serviceAreaId_Histo = data.serviceAreaId;
                    haulingRequestRequestbody.jobSiteId_Histo = data.jobSiteId;
                }
                else {
                    haulingRequestRequestbody.serviceAreaId = data.serviceAreaId;
                    haulingRequestRequestbody.jobSiteId = data.jobSiteId;
                }
                const haulingData = yield (0, haulingRequest_1.getOrderData)(ctx, {
                    data: haulingRequestRequestbody,
                });
                data.customer = haulingData.customer;
                data.jobSite = haulingData.jobSite;
                data.businessLine = haulingData.businessLine;
                data.businessUnit = haulingData.businessUnit;
                data.serviceArea = haulingData.serviceArea;
                data.billableService = haulingData.billableService;
                data.jobSiteContact = haulingData.jobSiteContact;
                data.subscriptionContact = haulingData.orderContact;
                data.purchaseOrder = haulingData.purchaseOrder;
                data.customerJobSite = haulingData.customerJobSite;
                data.thirdPartyHauler = haulingData.thirdPartyHauler;
                data.csr = ctx.state.user;
            }
            let dataSource2 = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let serviceItems = yield dataSource2.manager
                .createQueryBuilder()
                .select("serviceItems")
                .from(SubscriptionServiceItem_1.SubscriptionServiceItem, "serviceItems")
                .leftJoinAndMapMany("serviceItems.lineItems", // Row to map the information
            "SubscriptionLineItem", // Entity or table
            "lineItems", // Alias
            "serviceItems.id = lineItems.subscriptionServiceItemId")
                .leftJoinAndMapMany("serviceItems.subscriptionOrders", // Row to map the information
            "SubscriptionOrders", // Entity or table
            "subscriptionOrders", // Alias
            "serviceItems.id = subscriptionOrders.subscriptionServiceItemId")
                .where({ subscriptionId: data.id })
                .andWhere({ billingCycle: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) })
                .getMany();
            yield dataSource2.destroy();
            for (let index = 0; index < serviceItems.length; index++) {
                const element = serviceItems[index];
                let ids = [];
                let requestbody = {
                    materialId: element.materialId,
                    billableServiceId: element.billableServiceId,
                };
                if (serviceItems[index].serviceFrequencyId) {
                    ids.push(serviceItems[index].serviceFrequencyId);
                    requestbody.frequencyIds = ids;
                }
                const haulingData = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
                element.billableService = haulingData.billableService;
                if (haulingData.material) {
                    element.material = haulingData.material;
                }
                if (haulingData.frequencies) {
                    element.serviceFrequency = haulingData.frequencies;
                    data.serviceFrequencyAggregated = haulingData.frequencies[0];
                }
                for (let indexSO = 0; indexSO < element.subscriptionOrders.length; indexSO++) {
                    const subsOrder = element.subscriptionOrders[indexSO];
                    let requestbody = {
                        billableServiceId: element.subscriptionOrders[indexSO].billableServiceId,
                    };
                    const haulingDataSubsOrder = yield (0, haulingRequest_1.getOrderData)(ctx, {
                        data: requestbody,
                    });
                    Object.assign(subsOrder, haulingDataSubsOrder);
                }
                for (let indexLI = 0; indexLI < element.lineItems.length; indexLI++) {
                    const lineItem = element.lineItems[indexLI];
                    let requestbody = {
                        billableLineItemId: element.lineItems[indexLI].billableLineItemId,
                    };
                    const haulingDataLineItem = yield (0, haulingRequest_1.getOrderData)(ctx, {
                        data: requestbody,
                    });
                    Object.assign(lineItem, haulingDataLineItem);
                }
            }
            data.serviceName = (0, subscriptionServiceName_1.subscriptionServiceName)(serviceItems);
            data.serviceItems = serviceItems;
            let dataSource3 = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let serviceData = yield dataSource3
                .createQueryBuilder()
                .select("subsOrders")
                .from(SubscriptionOrders_1.SubscriptionOrders, "subsOrders")
                .leftJoinAndMapOne("subsOrders.tempNextServiceDate", "SubscriptionServiceItem", "subServiceItem", "subsOrders.subscriptionServiceItemId = subServiceItem.id")
                .where({ subscriptionId: subscriptionId })
                .getMany();
            yield dataSource3.destroy();
            const nextServiceDate = (_a = serviceData.find((servicedate) => (servicedate.tempNextServiceDate.id = data.id))) === null || _a === void 0 ? void 0 : _a.serviceDate;
            data.nextServiceDate = nextServiceDate;
            ctx.body = data;
            ctx.status = 200;
            return;
        });
    }
    getSubscriptionsList(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { businessUnitId, csrEmail, customerId, status, skip = 0, limit = 25, subIds } = ctx.request.body;
            let whereFilter = {};
            if (subIds) {
                whereFilter["id"] = (0, typeorm_1.In)(subIds);
            }
            if (businessUnitId) {
                whereFilter["businessUnitId"] = businessUnitId;
            }
            if (csrEmail) {
                whereFilter["csrEmail"] = csrEmail;
            }
            if (status) {
                whereFilter["status"] = status;
            }
            if (customerId) {
                whereFilter["customerId"] = customerId;
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource
                .createQueryBuilder()
                .select([
                "subscriptions.id",
                "subscriptions.csrEmail",
                "subscriptions.status",
                "subscriptions.startDate",
                "subscriptions.endDate",
                "subscriptions.equipmentType",
                "subscriptions.paymentMethod",
                "subscriptions.grandTotal",
                "subscriptions.billingCycle",
                "subscriptions.billingType",
                "subscriptions.createdAt",
                "subscriptions.updatedAt",
                "subscriptions.jobSiteId",
                "subscriptions.businessLineId",
                "subscriptions.businessUnitId",
                "subscriptions.serviceAreaId",
                "subscriptions.customerId",
            ])
                .from(Subscriptions_1.Subscriptions, "subscriptions")
                .where(whereFilter)
                .skip(skip)
                .take(limit)
                .getMany();
            yield dataSource.destroy();
            let response = [];
            response = yield Promise.all(data.map((elementSubs) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let requestbody = {
                    jobSiteId: elementSubs.jobSiteId,
                    customerId_Histo: elementSubs.customerId,
                    businessLineId: elementSubs.businessLineId,
                    businessUnitId: elementSubs.businessUnitId,
                    serviceAreaId: elementSubs.serviceAreaId,
                };
                const haulingData = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
                let dataSource2 = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
                let serviceItems = yield dataSource2.manager
                    .createQueryBuilder()
                    .select("serviceItems")
                    .from(SubscriptionServiceItem_1.SubscriptionServiceItem, "serviceItems")
                    .leftJoinAndMapMany("serviceItems.lineItems", // Row to map the information
                "SubscriptionLineItem", // Entity or table
                "lineItems", // Alias
                "serviceItems.id = lineItems.subscriptionServiceItemId")
                    .leftJoinAndMapMany("serviceItems.subscriptionOrders", // Row to map the information
                "SubscriptionOrders", // Entity or table
                "subscriptionOrders", // Alias
                "serviceItems.id = subscriptionOrders.subscriptionServiceItemId")
                    .where({ subscriptionId: elementSubs.id })
                    .andWhere({ billingCycle: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) })
                    .getMany();
                yield dataSource2.destroy();
                for (let index = 0; index < serviceItems.length; index++) {
                    const element = serviceItems[index];
                    let ids = [];
                    let requestbody = {
                        materialId: element.materialId,
                        billableServiceId: element.billableServiceId,
                    };
                    if (serviceItems[index].serviceFrequencyId) {
                        ids.push(serviceItems[index].serviceFrequencyId);
                        requestbody.frequencyIds = ids;
                    }
                    const serviceItemsData = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
                    element.billableService = serviceItemsData.billableService;
                    if (serviceItemsData.material) {
                        element.material = serviceItemsData.material;
                    }
                    if (serviceItemsData.frequencies) {
                        element.serviceFrequency = serviceItemsData.frequencies;
                        elementSubs.serviceFrequencyAggregated = serviceItemsData.frequencies[0];
                    }
                    element.subscriptionOrders = yield Promise.all(element.subscriptionOrders.map((subsOrder) => __awaiter(this, void 0, void 0, function* () {
                        let requestbody = {
                            billableServiceId: subsOrder.billableServiceId,
                        };
                        const haulingDataSubsOrder = yield (0, haulingRequest_1.getOrderData)(ctx, {
                            data: requestbody,
                        });
                        return Object.assign(subsOrder, haulingDataSubsOrder);
                    })));
                    element.lineItems = yield Promise.all(element.lineItems.map((lineItem) => __awaiter(this, void 0, void 0, function* () {
                        let requestbody = {
                            billableLineItemId: lineItem.billableLineItemId,
                        };
                        const haulingDataLineItem = yield (0, haulingRequest_1.getOrderData)(ctx, {
                            data: requestbody,
                        });
                        return Object.assign(lineItem, haulingDataLineItem);
                    })));
                }
                elementSubs.serviceName = (0, subscriptionServiceName_1.subscriptionServiceName)(serviceItems);
                elementSubs.serviceItems = serviceItems;
                let dataSource3 = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
                let serviceData = yield dataSource3
                    .createQueryBuilder()
                    .select("subsOrders")
                    .from(SubscriptionOrders_1.SubscriptionOrders, "subsOrders")
                    .leftJoinAndMapOne("subsOrders.tempNextServiceDate", "SubscriptionServiceItem", "subServiceItem", "subsOrders.subscriptionServiceItemId = subServiceItem.id")
                    .where({ subscriptionId: elementSubs.id })
                    .getMany();
                yield dataSource3.destroy();
                const nextServiceDate = (_a = serviceData.find((servicedate) => (servicedate.tempNextServiceDate.id = elementSubs.id))) === null || _a === void 0 ? void 0 : _a.serviceDate;
                return Object.assign(Object.assign({}, elementSubs), { serviceArea: haulingData.serviceArea, jobSite: haulingData.jobSite, customer: haulingData.customer, businessLine: haulingData.businessLine, businessUnit: haulingData.businessUnit, nextServiceDate: nextServiceDate });
            })));
            ctx.body = response;
            ctx.status = 200;
        });
    }
    getSubscriptionsListToInvoice(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { businessUnitId, csrEmail, customerId, status, subIds } = ctx.request.body;
            let whereFilter = {};
            if (subIds) {
                whereFilter["id"] = (0, typeorm_1.In)(subIds);
            }
            if (businessUnitId) {
                whereFilter["businessUnitId"] = businessUnitId;
            }
            if (csrEmail) {
                whereFilter["csrEmail"] = csrEmail;
            }
            if (status) {
                whereFilter["status"] = status;
            }
            if (customerId) {
                whereFilter["customerId"] = customerId;
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource
                .createQueryBuilder()
                .select([
                "subscriptions.id",
                "subscriptions.nextBillingPeriodFrom",
                "subscriptions.nextBillingPeriodTo",
                "subscriptions.invoicedDate",
                "subscriptions.billingCycle",
            ])
                .from(Subscriptions_1.Subscriptions, "subscriptions")
                .where(whereFilter)
                .getMany();
            yield dataSource.destroy();
            let response = data;
            ctx.body = response;
            ctx.status = 200;
        });
    }
    getSubscriptionsCount(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { businessUnitId, customerId } = ctx.request.body;
            const { schemaName } = ctx.state.user;
            let summary = {
                total: 0,
                statuses: { active: 0, closed: 0, draft: 0, onHold: 0 },
            };
            const countNames = ["active", "closed", "draft", "onHold"];
            let promises = [];
            for (let index = 0; index < countNames.length; index++) {
                const countItem = countNames[index];
                let filter = { match: {} };
                filter.match["status"] = countItem;
                let queryTemplate = {
                    query: {
                        bool: {
                            must: [
                                {
                                    match: {
                                        businessUnitId: businessUnitId,
                                    },
                                },
                            ],
                        },
                    },
                };
                queryTemplate.query.bool.must.push(filter);
                const promise = (0, elasticSearch_1.count)(ctx, searchIndices_1.TENANT_INDEX.subscriptions, (0, elasticSearch_1.applyTenantToIndex)(searchIndices_1.TENANT_INDEX.subscriptions, schemaName), {
                    value: countItem,
                    query: queryTemplate,
                });
                promises.push(promise);
            }
            yield Promise.all(promises)
                .then((result) => {
                result.forEach((s) => {
                    summary.total = summary.total + s.count;
                    summary.statuses[s.status] = s.count;
                });
            })
                .catch((reason) => {
                ctx.body = reason;
                ctx.status = 500;
            });
            ctx.body = summary;
            ctx.status = 200;
        });
    }
    getDraftSubscription(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = ctx.request.body;
            const subscriptionId = body.id;
            const customerId = body.customerId;
            let whereFilter = { id: subscriptionId };
            if (customerId) {
                whereFilter.customerId = customerId;
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let subscriptionData = yield dataSource.manager
                .createQueryBuilder()
                .select("subscriptions")
                .from(Subscriptions_1.Subscriptions, "subscriptions")
                .where(whereFilter)
                .getOne();
            if (subscriptionData) {
                const serviceItemsData = yield dataSource.manager
                    .createQueryBuilder()
                    .select("subscriptionServiceItem")
                    .from(SubscriptionServiceItem_1.SubscriptionServiceItem, "subscriptionServiceItem")
                    .where({ subscriptionId: subscriptionId })
                    .getMany();
                const extendedSubscriptionServiceItems = yield Promise.all(serviceItemsData.map((serviceItem) => __awaiter(this, void 0, void 0, function* () {
                    const response = yield (0, haulingRequest_1.getOrderData)(ctx, {
                        data: {
                            billableServiceId: serviceItem.billableServiceId,
                        },
                    });
                    return Object.assign(Object.assign({}, serviceItem), { billableService: response.billableService });
                })));
                let haulingRequestRequestbody = {
                    jobSiteId: subscriptionData.jobSiteId,
                    customerId: subscriptionData.customerId,
                    businessLineId: subscriptionData.businessLineId,
                    businessUnitId: subscriptionData.businessUnitId,
                    serviceAreaId: subscriptionData.serviceAreaId,
                    billableServiceId: subscriptionData.billableServiceId,
                    jobSiteContactId: subscriptionData.jobSiteContactId,
                    purchaseOrderId: subscriptionData.purchaseOrderId,
                };
                const haulingData = yield (0, haulingRequest_1.getOrderData)(ctx, {
                    data: haulingRequestRequestbody,
                });
                subscriptionData.customer = haulingData.customer;
                subscriptionData.jobSite = haulingData.jobSite;
                subscriptionData.customer = haulingData.customer;
                subscriptionData.businessLine = haulingData.businessLine;
                subscriptionData.businessUnit = haulingData.businessUnit;
                subscriptionData.serviceArea = haulingData.serviceArea;
                subscriptionData.billableService = haulingData.billableService;
                subscriptionData.jobSiteContact = haulingData.jobSiteContact;
                subscriptionData.subscriptionContact = haulingData.orderContact;
                subscriptionData.bestTimeToComeFrom = ""; //todo
                subscriptionData.bestTimeToComeTo = ""; //todo
                subscriptionData.customer = { originalId: subscriptionData.customerId };
                subscriptionData.nextBillingPeriodFrom = subscriptionData.createdAt; //todo
                subscriptionData.nextBillingPeriodTo = subscriptionData.createdAt; //todo
                subscriptionData.serviceName = subscriptionData.equipmentType;
                subscriptionData.subscriptionContact = {
                    originalId: subscriptionData.subscriptionContactId,
                };
                subscriptionData.jobSite = { originalId: subscriptionData.jobSiteId };
                subscriptionData.purchaseOrder = haulingData.purchaseOrder;
                subscriptionData.competitor = null; //todo
                subscriptionData.lineItems = []; //TODO: fix this later
            }
            ctx.body = subscriptionData;
            ctx.status = 200;
            yield dataSource.destroy();
        });
    }
    closeEndingSubscriptions(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { businessUnitId, ids } = ctx.request.body;
            const dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const subscriptionsToClose = yield dataSource.getRepository(Subscriptions_1.Subscriptions).findBy({ id: (0, typeorm_1.In)(ids) });
            const queryRunner = dataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction("SERIALIZABLE");
            try {
                const updatePayload = {
                    status: "closed",
                    reason: "Subscription has been expired",
                };
                yield queryRunner.manager.update(Subscriptions_1.Subscriptions, { id: (0, typeorm_1.In)(ids) }, updatePayload);
                yield Promise.all(subscriptionsToClose.map((s) => __awaiter(this, void 0, void 0, function* () {
                    const historicalSubscription = Object.assign(Object.assign(Object.assign({}, s), updatePayload), base_controller_1.BaseController.historicalAttributes("edited", s.id, ctx));
                    yield queryRunner.manager.insert(SubscriptionsHistorical_1.SubscriptionsHistorical, historicalSubscription);
                })));
                yield queryRunner.commitTransaction();
            }
            catch (e) {
                yield queryRunner.rollbackTransaction();
            }
            finally {
                yield queryRunner.release();
            }
            yield dataSource.destroy();
            ctx.body = ids;
            ctx.status = 200;
        });
    }
    getEndingSubscriptions(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { businessUnitId } = ctx.request.body;
            const dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const endingSubscriptions = yield dataSource
                .getRepository(Subscriptions_1.Subscriptions)
                .createQueryBuilder("s")
                //.where("s.businessUnitId = :businessUnitId", { businessUnitId })
                .where("s.status <> :status", { status: "closed" })
                .andWhere("s.endDate < :now", { now: (0, date_fns_1.startOfToday)() })
                .getMany();
            yield dataSource.destroy();
            ctx.status = 200;
            ctx.body = endingSubscriptions;
        });
    }
    getSubscriptionsServiceItems(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const { businessUnitId, businessLineIds, thirdPartyHaulerId, frequencyIds, status } = ctx.request.body;
            let whereFilter = {};
            if (frequencyIds) {
                whereFilter.serviceFrequencyId = (0, typeorm_1.In)(frequencyIds);
            }
            let query = dataSource
                .getRepository(SubscriptionServiceItem_1.SubscriptionServiceItem)
                .createQueryBuilder("subscriptionServiceItem")
                .innerJoinAndMapOne("subscriptionServiceItem.subscription", "Subscriptions", "subscription", `subscription.id = subscriptionServiceItem.subscriptionId AND subscription.businessUnitId = ${businessUnitId}  AND subscription.businessLineId IN (:...ids) AND subscription.status = '${status}'`, { ids: businessLineIds })
                .where(whereFilter);
            if (thirdPartyHaulerId) {
                query = query.andWhere(`subscription.thirdPartyHaulerId = ${thirdPartyHaulerId}`);
            }
            const subscriptionsServiceItems = yield query.getMany();
            yield dataSource.destroy();
            ctx.status = 200;
            ctx.body = subscriptionsServiceItems;
        });
    }
    getSubscriptionsPaginated(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionsRespository = new repository_1.SubscriptionsRespository();
            const { email, schemaName } = ctx.state.user;
            const _a = ctx.request.query, { skip = 0, limit = 25, mine, sortBy = "id", sortOrder = sortOrders_1.SORT_ORDER.asc, businessLine } = _a, filters = __rest(_a, ["skip", "limit", "mine", "sortBy", "sortOrder", "businessLine"]);
            getfilters({ mine, email, businessLine }, filters); //update filters
            let bool;
            const sort = [{ [subscriptionAttributes_1.SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS_INDEX[sortBy]]: sortOrder }];
            if (filters) {
                const must = Object.keys(filters).map((key) => {
                    return { match: { [key]: filters[key] } };
                });
                bool = { must };
            }
            const subscriptionsResult = yield (0, elasticSearch_1.search)(ctx, searchIndices_1.TENANT_INDEX.subscriptions, (0, elasticSearch_1.applyTenantToIndex)(searchIndices_1.TENANT_INDEX.subscriptions, schemaName), Object.assign(Object.assign({ skip: Number(skip), limit: Math.min(Number(limit)) }, filters), { sort,
                bool }));
            let subscriptions = [];
            if (subscriptionsResult === null || subscriptionsResult === void 0 ? void 0 : subscriptionsResult.subscriptions) {
                subscriptions = yield subscriptionsRespository.extendSubscription(ctx, subscriptionsResult.subscriptions);
            }
            ctx.body = subscriptions;
            ctx.status = httpStatusCodes_1.default.OK;
        });
    }
    streamTenant(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionsRespository = new repository_1.SubscriptionsRespository();
            const { tenantName } = ctx.request.body;
            const dataSource = yield base_controller_1.BaseController.getDataSource(tenantName);
            const subscriptionData = yield dataSource.manager
                .createQueryBuilder()
                .from(Subscriptions_1.Subscriptions, "subscriptions")
                .select("*")
                .execute();
            let subscriptions = [];
            if (subscriptionData) {
                subscriptions = yield subscriptionsRespository.extendSubscriptionTenant(ctx, subscriptionData, tenantName);
            }
            ctx.body = subscriptions;
            ctx.status = 200;
            return next();
        });
    }
    getSearch(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = ctx.request.query, { query, skip = 0, limit = 25, customerId, businessLine, mine, sortBy = "id", sortOrder = sortOrders_1.SORT_ORDER.asc } = _a, filters = __rest(_a, ["query", "skip", "limit", "customerId", "businessLine", "mine", "sortBy", "sortOrder"]);
            const subscriptionsRespository = new repository_1.SubscriptionsRespository();
            const { email, schemaName } = ctx.state.user;
            const { searchId, searchQuery } = (0, search_1.parseSearchQuery)(query);
            getfilters({ customerId, mine, email, businessLine }, filters); //update filters
            const sort = [{ [subscriptionAttributes_1.SUBSCRIPTIONS_TABLE_AND_FIELD_SORT_PARAMS_INDEX[sortBy]]: sortOrder }];
            const mainFilter = {
                skip: Number(skip),
                limit: Number(limit),
                sort,
            };
            let subscriptionsResult = [];
            if (searchQuery) {
                let requestResponse = yield (0, hauling_1.getJobSiteSearchQuery)(ctx, {
                    data: { searchQuery },
                });
                if (requestResponse.jobSites) {
                    const newBool = (0, mustFilterES_1.mustFilterES)(filters);
                    const filter = [
                        {
                            terms: {
                                jobSiteId: requestResponse.jobSites,
                            },
                        },
                    ];
                    newBool.filter = filter;
                    const subByJobSite = yield (0, subscriptions_1.searchSubscriptionsES)(ctx, schemaName, Object.assign(Object.assign(Object.assign({}, mainFilter), filters), { bool: newBool }));
                    if (subByJobSite === null || subByJobSite === void 0 ? void 0 : subByJobSite.subscriptions) {
                        subscriptionsResult = [...subByJobSite.subscriptions, ...subscriptionsResult];
                    }
                }
                if (requestResponse.customer) {
                    const newBool = (0, mustFilterES_1.mustFilterES)(filters);
                    const filter = [
                        {
                            terms: {
                                customerId: requestResponse.customer,
                            },
                        },
                    ];
                    newBool.filter = filter;
                    const subByCustomer = yield (0, subscriptions_1.searchSubscriptionsES)(ctx, schemaName, Object.assign(Object.assign(Object.assign({}, mainFilter), filters), { bool: newBool }));
                    if (subByCustomer === null || subByCustomer === void 0 ? void 0 : subByCustomer.subscriptions) {
                        subscriptionsResult = [...subByCustomer === null || subByCustomer === void 0 ? void 0 : subByCustomer.subscriptions, ...subscriptionsResult];
                    }
                }
            }
            if (searchId) {
                filters.id = searchId;
                const newBool = (0, mustFilterES_1.mustFilterES)(filters);
                const subById = yield (0, subscriptions_1.searchSubscriptionsES)(ctx, schemaName, Object.assign(Object.assign(Object.assign({}, mainFilter), filters), { bool: newBool }));
                subscriptionsResult = [...subById === null || subById === void 0 ? void 0 : subById.subscriptions, ...subscriptionsResult];
            }
            let subscriptions = [];
            if (subscriptionsResult) {
                subscriptions = yield subscriptionsRespository.extendSubscription(ctx, subscriptionsResult);
            }
            ctx.body = subscriptions;
            ctx.status = httpStatusCodes_1.default.OK;
        });
    }
}
exports.SubscriptionsController = SubscriptionsController;
// Update the filters object based on thedata
const getfilters = ({ customerId, businessLine, mine, email }, filters) => {
    if (customerId) {
        filters.customerId = customerId;
    }
    if (mine === "true") {
        filters["csrEmail"] = email;
    }
    if (businessLine) {
        filters.businessLineId = businessLine;
    }
};
//# sourceMappingURL=subscriptions.controller.js.map