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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const typeorm_1 = require("typeorm");
const LineItems_1 = require("./../../database/entities/tenant/LineItems");
const ThresholdItems_1 = require("./../../database/entities/tenant/ThresholdItems");
const haulingRequest_1 = require("./../../request/haulingRequest");
const Orders_1 = require("../../database/entities/tenant/Orders");
const base_controller_1 = require("../base.controller");
const SurchargeItem_1 = require("../../database/entities/tenant/SurchargeItem");
const OrderTaxDistrict_1 = require("../../database/entities/tenant/OrderTaxDistrict");
const httpStatusCodes_1 = require("../../consts/httpStatusCodes");
const OrdersHistorical_1 = require("../../database/entities/tenant/OrdersHistorical");
const calclSurcharges_1 = require("../../utils/calclSurcharges");
const haulingRequest_2 = require("./../../request/haulingRequest");
class OrdersController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getOrdersByOrderTemplate(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const recurrentOrder = yield dataSource
                .createQueryBuilder()
                .select("orders.*")
                .from(Orders_1.Orders, "orders")
                .innerJoin("RecurrentOrderTemplateOrder", "recurrentOrderTemplateOrder", "recurrentOrderTemplateOrder.orderId = orders.id")
                .where("recurrentOrderTemplateOrder.recurrentOrderTemplateId = :id", ctx.request.body)
                .limit(25)
                .offset(0)
                .orderBy("orders.id", "DESC")
                .getRawMany();
            let response = [];
            if (recurrentOrder && recurrentOrder.length > 0) {
                for (let index = 0; index < recurrentOrder.length; index++) {
                    let tmp = {};
                    tmp.id = recurrentOrder[index].id;
                    tmp.workOrderId = recurrentOrder[index].work_order_id;
                    tmp.serviceDate = recurrentOrder[index].service_date;
                    tmp.status = recurrentOrder[index].status;
                    tmp.billableServiceId = recurrentOrder[index].billable_service_id;
                    tmp.grandTotal = recurrentOrder[index].grand_total;
                    tmp.materialId = recurrentOrder[index].material_id;
                    tmp.businessUnitId = recurrentOrder[index].business_unit_id;
                    tmp.businessLineId = recurrentOrder[index].business_line_id;
                    response.push(tmp);
                }
            }
            ctx.body = response;
            ctx.status = 200;
            yield dataSource.destroy();
            return next();
        });
    }
    getOrdersSelect(ctx, next) {
        const _super = Object.create(null, {
            getDataBy: { get: () => super.getDataBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const { condition, fields } = ctx.request.body;
            let body = {};
            let where = {};
            let sendLineItems = false;
            let sendThresholds = false;
            let sendTaxDistricts = false;
            if (fields) {
                if (fields.indexOf("lineItems") != -1) {
                    fields.splice(fields.indexOf("lineItems", 0), 1);
                    sendLineItems = true;
                }
                if (fields.indexOf("thresholds") != -1) {
                    fields.splice(fields.indexOf("thresholds", 0), 1);
                    sendThresholds = true;
                }
                if (fields.indexOf("taxDistricts") != -1) {
                    fields.splice(fields.indexOf("taxDistricts", 0), 1);
                    sendTaxDistricts = true;
                }
                fields.push("billableServicePrice");
                fields.push("billableServiceTotal");
                fields.push("billableLineItemsTotal");
                fields.push("initialGrandTotal");
                fields.push("surchargesTotal");
                fields.push("thresholdsTotal");
                fields.push("beforeTaxesTotal");
                fields.push("grandTotal");
                body.select = fields;
            }
            if (condition) {
                if (condition.id) {
                    where.id = condition.id;
                }
            }
            body.where = where;
            ctx.request.body = body;
            let orders = yield _super.getDataBy.call(this, ctx, Orders_1.Orders);
            let order = orders[0];
            if (sendLineItems) {
                ctx.request.body = { where: { orderId: order.id } };
                order.lineItems = yield _super.getDataBy.call(this, ctx, LineItems_1.LineItems);
            }
            if (sendThresholds) {
                ctx.request.body = { where: { orderId: order.id } };
                order.thresholds = yield _super.getDataBy.call(this, ctx, ThresholdItems_1.ThresholdItems);
            }
            if (sendTaxDistricts) {
                ctx.request.body = { where: { orderId: order.id } };
                order.taxDistricts = [];
                let orderTaxDistrict = yield _super.getDataBy.call(this, ctx, OrderTaxDistrict_1.OrderTaxDistrict);
                if (orderTaxDistrict && orderTaxDistrict.length > 0) {
                    for (let index = 0; index < orderTaxDistrict.length; index++) {
                        let requestbody = {
                            taxDistrictId: orderTaxDistrict[index].taxDistrictId,
                        };
                        let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
                        order.taxDistricts.push(requestResponse.taxDistricts[0]);
                    }
                }
            }
            ctx.body = order;
            ctx.status = 200;
            return next();
        });
    }
    getOrders(ctx, next, history = false) {
        const _super = Object.create(null, {
            getDataBy: { get: () => super.getDataBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = ctx.state.user;
            const { limit, skip, sortBy, sortOrder, finalizedOnly, businessUnitId, mine, status, query } = ctx.request.query;
            const { workOrderId, id, disposalSite, customerId, originalCustomerId, serviceDate, orderIds } = ctx.request.body;
            let body = {};
            let where = {};
            let sort = {};
            if (skip) {
                body.skip = +skip;
            }
            if (limit) {
                body.take = +limit;
            }
            if (sortBy) {
                let tmp = sortBy.toString();
                if (history) {
                    sort = { id: "desc" };
                }
                else {
                    tmp = validateSort(tmp);
                    sort = { [tmp]: sortOrder ? sortOrder : "ASC" };
                }
            }
            if (status) {
                if (status === "finalized" && finalizedOnly === "false") {
                    where.status = (0, typeorm_1.In)(["finalized", "canceled"]);
                }
                else {
                    where.status = status;
                }
            }
            if (mine === "true") {
                where.csrEmail = email;
            }
            if (mine === "true") {
                where.csrEmail = email;
            }
            if (businessUnitId) {
                where.businessUnitId = businessUnitId;
            }
            if (customerId) {
                where.customerId = customerId;
            }
            if (originalCustomerId) {
                where.originalCustomerId = originalCustomerId;
            }
            if (serviceDate) {
                where.serviceDate = (0, typeorm_1.LessThanOrEqual)(serviceDate);
            }
            if (workOrderId) {
                where.workOrderId = workOrderId;
            }
            if (disposalSite) {
                where.disposalSiteId = (0, typeorm_1.Not)((0, typeorm_1.IsNull)());
            }
            let getmoreInfo = false;
            if (id) {
                getmoreInfo = true;
                if (history) {
                    where.originalId = id;
                }
                else {
                    where.id = id;
                }
            }
            if (orderIds) {
                where.id = (0, typeorm_1.In)(orderIds);
            }
            body.where = where;
            body.order = sort;
            ctx.request.body = body;
            let orders = [];
            if (history) {
                orders = yield _super.getDataBy.call(this, ctx, OrdersHistorical_1.OrdersHistorical);
            }
            else {
                orders = yield _super.getDataBy.call(this, ctx, Orders_1.Orders);
            }
            let response = [];
            let promisesArray = [];
            const getData = (index, tmp, taxIds) => new Promise((res) => __awaiter(this, void 0, void 0, function* () {
                let requestbody = {
                    businessLineId: tmp.businessLineId,
                    workOrderId: tmp.workOrderId,
                    jobSiteId: tmp.jobSiteId,
                    isRollOff: tmp.isRollOff,
                    customerId: tmp.customerId,
                    billableServiceId: tmp.billableServiceId,
                    materialId: tmp.materialId,
                    equipmentItemId: tmp.equipmentItemId,
                    serviceAreaId: tmp.serviceAreaId,
                    businessUnitId: tmp.businessUnitId,
                    purchaseOrderId: tmp.purchaseOrderId,
                    taxDistricts: taxIds,
                    permitId: tmp.permitId,
                    customRatesGroupId: tmp.customRatesGroupId,
                    customRatesGroupServicesId: tmp.customRatesGroupServicesId,
                    orderContactIdHistoById: tmp.orderContactId,
                    jobSiteContactIdHistoById: tmp.jobSiteContactId,
                    customerJobSiteId: tmp.customerJobSiteId,
                    disposalSiteId: tmp.disposalSiteId,
                    thirdPartyHaulerId: tmp.thirdPartyHaulerId,
                    promoId: tmp.promoId,
                    projectId: tmp.projectId,
                    landfillOperationId: tmp.id,
                };
                let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
                Object.assign(response[index], requestResponse);
                return res();
            }));
            const getDataThreshold = (index, indexThreshold, tmp) => new Promise((res) => __awaiter(this, void 0, void 0, function* () {
                let requestThreshold = {
                    thresholdId: tmp.thresholdId,
                    globalRatesThresholdsId: tmp.globalRatesThresholdsId,
                    customRatesGroupThresholdsId: tmp.customRatesGroupThresholdsId,
                };
                let responseThreshold = yield (0, haulingRequest_1.getOrderData)(ctx, {
                    data: requestThreshold,
                });
                Object.assign(response[index].thresholds[indexThreshold], responseThreshold);
                return res();
            }));
            if (orders && orders.length > 0) {
                for (let index = 0; index < orders.length; index++) {
                    ctx.request.body = { where: { orderId: orders[index].id } };
                    let orderTax = yield _super.getDataBy.call(this, ctx, OrderTaxDistrict_1.OrderTaxDistrict);
                    let taxIds = [];
                    orderTax.forEach((element) => {
                        taxIds.push(element.taxDistrictId);
                    });
                    let tmp = orders[index];
                    ctx.request.body.select = [
                        "billableLineItemId",
                        "billableServiceId",
                        "globalRatesSurchargesId",
                        "customRatesGroupSurchargesId",
                        "amount",
                        "materialId",
                        "surchargeId",
                    ];
                    let surcharge = yield _super.getDataBy.call(this, ctx, SurchargeItem_1.SurchargeItem);
                    delete ctx.request.body.select;
                    if ((surcharge === null || surcharge === void 0 ? void 0 : surcharge.length) > 0 && getmoreInfo) {
                        let surchargeNew = [];
                        for (let index2 = 0; index2 < surcharge.length; index2++) {
                            let item = surcharge[index2];
                            item.price = item.amount;
                            delete item.amount;
                            let requestSurcharge = {
                                billableServiceId: item.billableServiceId,
                                materialId: item.materialId,
                                surchargeId: item.surchargeId,
                                globalRatesSurchargesId: item.globalRatesSurchargesId,
                                customRatesGroupSurchargesId: item.customRatesGroupSurchargesId,
                            };
                            let responseSurcharge = yield (0, haulingRequest_1.getOrderData)(ctx, {
                                data: requestSurcharge,
                            });
                            Object.assign(item, responseSurcharge);
                            surchargeNew.push(item);
                        }
                        tmp.surcharges = surchargeNew;
                    }
                    let lineItem = yield _super.getDataBy.call(this, ctx, LineItems_1.LineItems);
                    if ((lineItem === null || lineItem === void 0 ? void 0 : lineItem.length) > 0) {
                        let lineItemNew = [];
                        for (let index2 = 0; index2 < lineItem.length; index2++) {
                            let item = lineItem[index2];
                            let requestLineItem = {
                                materialId_Histo: item.materialId,
                                billableLineItemId: item.billableLineItemId,
                                customRatesGroupLineItemsId: item.customRatesGroupLineItemsId,
                                globalRatesLineItemsId: item.globalRatesLineItemsId,
                                globalRatesSurchargesId: item.globalRatesSurchargesId,
                                surchargeId: item.surchargeId,
                            };
                            let responseLineItem = yield (0, haulingRequest_1.getOrderData)(ctx, {
                                data: requestLineItem,
                            });
                            Object.assign(item, responseLineItem);
                            lineItemNew.push(item);
                        }
                        tmp.lineItems = lineItemNew;
                    }
                    let thresholds = yield _super.getDataBy.call(this, ctx, ThresholdItems_1.ThresholdItems);
                    if ((thresholds === null || thresholds === void 0 ? void 0 : thresholds.length) > 0 && getmoreInfo) {
                        let thresholdsNew = [];
                        for (let index2 = 0; index2 < thresholds.length; index2++) {
                            let item = thresholds[index2];
                            thresholdsNew.push(item);
                            promisesArray.push(getDataThreshold(index, index2, item));
                        }
                        tmp.thresholds = thresholdsNew;
                    }
                    promisesArray.push(getData(index, tmp, taxIds));
                    response.push(tmp);
                }
            }
            yield Promise.all(promisesArray);
            if (query) {
                response = response.filter((item) => {
                    var _a, _b;
                    return item.id.toString().includes(query) ||
                        item.workOrderId.toString().includes(query) ||
                        item.businessLine.name.includes(query) ||
                        item.jobSite.address.addressLine1.includes(query) ||
                        item.billableService.description.includes(query) ||
                        ((_a = item.customer.businessName) === null || _a === void 0 ? void 0 : _a.includes(query)) ||
                        ((_b = item.customer.name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(query)) ||
                        item.grandTotal.toString().includes(query);
                });
            }
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    getOrderHistorical(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            return new OrdersController().getOrders(ctx, next, true);
        });
    }
    getOrdersBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, Orders_1.Orders);
        });
    }
    addOrders(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical);
        });
    }
    approveOrder(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource.manager.findOneBy(Orders_1.Orders, { id });
            if (!data || data.status !== "completed") {
                ctx.body = undefined;
                ctx.status = 404;
                yield dataSource.destroy();
                return next();
            }
            ctx.request.body = dataChangeStatus(ctx, "approved");
            return _super.update.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical, id);
        });
    }
    unfinalizedOrder(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            const { comment } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource.manager.findOneBy(Orders_1.Orders, { id });
            if (!data || data.status !== "finalized") {
                ctx.body = undefined;
                ctx.status = 404;
                return next();
            }
            ctx.request.body = { status: "approved", unfinalizedComment: comment };
            yield dataSource.destroy();
            return _super.update.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical, id);
        });
    }
    invoicedOrders(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const { businessUnitId, customerId, customers } = ctx.request.body;
            const filters = { status: (0, typeorm_1.In)(["finalized", "canceled"]), businessUnitId };
            if (customers && !customerId) {
                filters["customerId"] = typeorm_1.In[customers];
            }
            if (customerId && !customers) {
                filters["customerId"] = customerId;
            }
            ctx.request.body.where = filters;
            return _super.getBy.call(this, ctx, next, Orders_1.Orders);
        });
    }
    unapproveOrder(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            const { comment } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource.manager.findOneBy(Orders_1.Orders, { id });
            if (!data || data.status !== "approved") {
                ctx.body = undefined;
                ctx.status = 404;
                return next();
            }
            ctx.request.body = { status: "completed", unapprovedComment: comment };
            yield dataSource.destroy();
            return _super.update.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical, id);
        });
    }
    bulkApproveOrder(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { updatedAt, businessUnitId } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.update(Orders_1.Orders, { businessUnitId: businessUnitId, status: "completed" }, { status: "approved", updatedAt: updatedAt });
            ctx.status = httpStatusCodes_1.default.OK;
            yield dataSource.destroy();
            return next();
        });
    }
    finalizedOrder(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource.manager.findOneBy(Orders_1.Orders, { id });
            if (!data || data.status !== "approved") {
                ctx.body = undefined;
                ctx.status = 404;
                return next();
            }
            ctx.request.body = dataChangeStatus(ctx, "finalized");
            yield dataSource.destroy();
            return _super.update.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical, id);
        });
    }
    bulkFinalizedOrder(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { businessUnitId } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.update(Orders_1.Orders, { businessUnitId: businessUnitId, status: "approved" }, { status: "finalized" });
            ctx.status = httpStatusCodes_1.default.OK;
            yield dataSource.destroy();
            return next();
        });
    }
    updateOrdersCascade(ctx, next) {
        const _super = Object.create(null, {
            updateVoid: { get: () => super.updateVoid },
            insertVoid: { get: () => super.insertVoid },
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            let { order, lineItem } = ctx.request.body;
            delete order.billableServicePriceToDisplay;
            delete order.billableServiceTotalToDisplay;
            delete order.billableLineItemsTotalToDisplay;
            delete order.thresholdsTotalToDisplay;
            delete order.surchargesTotalToDisplay;
            delete order.beforeTaxesTotalToDisplay;
            delete order.onAccountTotalToDisplay;
            delete order.initialGrandTotalToDisplay;
            delete order.grandTotalToDisplay;
            if (lineItem && lineItem.length > 0) {
                for (let index = 0; index < lineItem.length; index++) {
                    let item = lineItem[index];
                    let lineId = Object.assign({}, item);
                    delete item.globalRatesSurcharges;
                    delete item.surcharge;
                    delete item.id;
                    delete item.priceToDisplay;
                    delete item.billableLineItem;
                    delete item.globalRatesLineItem;
                    delete item.material;
                    item.orderId = id;
                    ctx.request.body = item;
                    if (lineId.id) {
                        _super.updateVoid.call(this, ctx, LineItems_1.LineItems, undefined, lineId.id);
                    }
                    else {
                        _super.insertVoid.call(this, ctx, LineItems_1.LineItems);
                    }
                }
            }
            ctx.request.body = order;
            return _super.update.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical, id);
        });
    }
    updateOrders(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const lineItems = ctx.request.body.lineItems;
            let id = +ctx.url.split("/")[4];
            delete ctx.request.body.lineItems;
            let finalOrderSurcharges;
            const { businessUnitId, businessLineId, customRatesGroupId, applySurcharges, billableServicePrice } = ctx.request.body;
            if (applySurcharges) {
                let type = customRatesGroupId ? "custom" : "global";
                const rates = yield (0, calclSurcharges_1.calcRates)(ctx, businessUnitId, businessLineId, customRatesGroupId, type);
                let customRates = rates === null || rates === void 0 ? void 0 : rates.customRates;
                let globalRates = rates === null || rates === void 0 ? void 0 : rates.globalRates;
                const surcharges = yield (0, haulingRequest_2.getBillableSurcharges)(ctx, {
                    data: { active: true, businessLineId },
                });
                const material = ctx.request.body.materialId;
                const billableService = ctx.request.body.billableServiceId;
                let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, {
                    data: { materialId: material, billableServiceId: billableService },
                });
                const materialId = (_a = requestResponse === null || requestResponse === void 0 ? void 0 : requestResponse.material) === null || _a === void 0 ? void 0 : _a.originalId;
                const billableServiceId = (_b = requestResponse === null || requestResponse === void 0 ? void 0 : requestResponse.billableService) === null || _b === void 0 ? void 0 : _b.originalId;
                const billableServiceApplySurcharges = (_c = requestResponse === null || requestResponse === void 0 ? void 0 : requestResponse.billableService) === null || _c === void 0 ? void 0 : _c.applySurcharges;
                const calclSurcharges = (0, calclSurcharges_1.calculateSurcharges)(globalRates === null || globalRates === void 0 ? void 0 : globalRates.globalRatesSurcharges, customRates === null || customRates === void 0 ? void 0 : customRates.customRatesSurcharges, materialId, billableServiceId, billableServicePrice, billableServiceApplySurcharges, lineItems, surcharges);
                let orderSurcharges = calclSurcharges.orderSurcharges;
                finalOrderSurcharges = yield (0, calclSurcharges_1.getOrderSurchargeHistoricalIds)(ctx, orderSurcharges, id);
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            if (lineItems && lineItems.length) {
                yield dataSource.manager.delete(LineItems_1.LineItems, {
                    orderId: id,
                });
                for (let i = 0; i < lineItems.length; i++) {
                    const request = {
                        billableLineItemIdHisto: lineItems[i].billableLineItemId,
                    };
                    const { billableLineItem } = yield (0, haulingRequest_1.getOrderData)(ctx, {
                        data: request,
                    });
                    const newLineItem = Object.assign(Object.assign({}, lineItems[i]), { orderId: id, billableLineItemId: billableLineItem.id });
                    yield dataSource.manager.insert(LineItems_1.LineItems, newLineItem);
                }
            }
            yield dataSource.manager.delete(SurchargeItem_1.SurchargeItem, {
                orderId: id,
            });
            if (finalOrderSurcharges && finalOrderSurcharges.length) {
                for (let i = 0; i < finalOrderSurcharges.length; i++) {
                    yield dataSource.manager.insert(SurchargeItem_1.SurchargeItem, finalOrderSurcharges[i]);
                }
            }
            const { jobSiteContactId, orderContactId } = ctx.request.body;
            if (jobSiteContactId && orderContactId) {
                let requestbody = {
                    orderContactIdHisto: orderContactId,
                    jobSiteContactIdHisto: jobSiteContactId,
                };
                const { jobSiteContact, orderContact } = yield (0, haulingRequest_1.getOrderData)(ctx, {
                    data: requestbody,
                });
                ctx.request.body = Object.assign(Object.assign({}, ctx.request.body), { jobSiteContactId: jobSiteContact.id, orderContactId: orderContact.id });
            }
            yield dataSource.destroy();
            return _super.update.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical, id);
        });
    }
    deleteOrders(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical);
        });
    }
    deleteCascadeOrders(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = ctx.url.split("/")[4];
            ctx.query.id = id;
            return _super.delete.call(this, ctx, next, Orders_1.Orders, OrdersHistorical_1.OrdersHistorical);
        });
    }
    getCount(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = ctx.state.user;
            const { mine, finalizedOnly, customerId, businessUnitId } = ctx.request.query;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let qb = dataSource
                .createQueryBuilder()
                .select("orders.status as status")
                .addSelect("COUNT(orders.status) as counter")
                .from(Orders_1.Orders, "orders");
            if (businessUnitId) {
                qb = qb.where(`orders.business_unit_id=${businessUnitId}`);
            }
            if (mine) {
                qb = qb.andWhere(`orders.csr_email='${email}'`);
            }
            if (customerId) {
                qb = qb.andWhere({ customerId: customerId });
            }
            qb = qb.groupBy("status");
            let statuses = {
                inProgress: 0,
                completed: 0,
                approved: 0,
                finalized: 0,
                canceled: 0,
                invoiced: 0,
            };
            let response = { total: 0, filteredTotal: 0 };
            const responseDB = yield qb.execute();
            let totalOrder = 0;
            for (let index = 0; index < responseDB.length; index++) {
                totalOrder += +responseDB[index].counter;
                if (responseDB[index].status === "inProgress") {
                    statuses.inProgress = +responseDB[index].counter;
                }
                else if (responseDB[index].status === "completed") {
                    statuses.completed = +responseDB[index].counter;
                }
                else if (responseDB[index].status === "approved") {
                    statuses.approved = +responseDB[index].counter;
                }
                else if (responseDB[index].status === "finalized") {
                    statuses.finalized = +responseDB[index].counter;
                }
                else if (responseDB[index].status === "canceled") {
                    statuses.canceled = +responseDB[index].counter;
                }
                else if (responseDB[index].status === "invoiced") {
                    statuses.invoiced = +responseDB[index].counter;
                }
            }
            if (finalizedOnly === "false" && statuses.canceled) {
                statuses.finalized += statuses.canceled;
                statuses.canceled = 0;
            }
            response.total = totalOrder;
            response.filteredTotal = totalOrder;
            response.statuses = statuses;
            ctx.body = response;
            ctx.status = 200;
        });
    }
    updateByIdOrderState(ctx, next) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            let _b = ctx.request.body, { ids } = _b, input = __rest(_b, ["ids"]);
            if (!ids) {
                ctx.state = httpStatusCodes_1.default.BAD_REQUEST;
                return next();
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.update(Orders_1.Orders, { id: (0, typeorm_1.In)(ids) }, input);
            let data = yield dataSource.manager.findBy(Orders_1.Orders, { id: (0, typeorm_1.In)(ids) });
            ctx.body = data;
            ctx.status = httpStatusCodes_1.default.OK;
            try {
                for (var data_1 = __asyncValues(data), data_1_1; data_1_1 = yield data_1.next(), !data_1_1.done;) {
                    const item = data_1_1.value;
                    let historical = Object.assign(Object.assign({}, data), base_controller_1.BaseController.historicalAttributes("edited", item === null || item === void 0 ? void 0 : item.id, ctx));
                    yield dataSource.manager.insert(OrdersHistorical_1.OrdersHistorical, historical);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (data_1_1 && !data_1_1.done && (_a = data_1.return)) yield _a.call(data_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            yield dataSource.destroy();
            return next();
        });
    }
}
exports.OrdersController = OrdersController;
const dataChangeStatus = (ctx, status) => {
    const { disposalSiteId } = ctx.request.body;
    const newData = { status };
    if (disposalSiteId) {
        newData["disposalSiteId"] = disposalSiteId;
    }
    return newData;
};
function validateSort(tmp) {
    if (tmp === "lineOfBusiness") {
        return "businessLineId";
    }
    else if (tmp === "woNumber") {
        return "workOrderId";
    }
    else if (tmp === "jobSite") {
        return "jobSiteId";
    }
    else if (tmp === "service") {
        return "serviceAreaId";
    }
    else if (tmp === "customerName") {
        return "customerId";
    }
    else if (tmp === "total") {
        return "grandTotal";
    }
    return tmp;
}
//# sourceMappingURL=orders.controller.js.map