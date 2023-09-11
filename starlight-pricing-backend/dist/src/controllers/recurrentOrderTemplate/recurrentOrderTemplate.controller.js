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
exports.RecurrentOrderTemplateController = void 0;
const RecurrentOrderTemplates_1 = require("../../database/entities/tenant/RecurrentOrderTemplates");
const RecurrentOrderTemplatesHistorical_1 = require("../../database/entities/tenant/RecurrentOrderTemplatesHistorical");
const base_controller_1 = require("../base.controller");
const haulingRequest_1 = require("./../../request/haulingRequest");
const httpStatusCodes_1 = require("../../consts/httpStatusCodes");
const orderStatuses_1 = require("../../consts/orderStatuses");
const RecurrentOrderTemplateOrder_1 = require("../../database/entities/tenant/RecurrentOrderTemplateOrder");
const ApiError_1 = require("../../utils/ApiError");
const Orders_1 = require("../../database/entities/tenant/Orders");
class RecurrentOrderTemplateController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getRecurrentOrderTemplateGeneratedOrders(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const recurrentOrder = yield dataSource.createQueryBuilder()
                .select("recurrentOrderTemplate")
                .from(RecurrentOrderTemplates_1.RecurrentOrderTemplate, "recurrentOrderTemplate")
                .leftJoinAndMapMany("recurrentOrderTemplate.lineItems", // Row to map the information
            "RecurrentOrderTemplateLineItems", // Entity or table
            "lineItems", // Alias
            "recurrentOrderTemplate.id = lineItems.recurrentOrderTemplateId" //Condition
            )
                .where(`recurrentOrderTemplate.id = ${id}`)
                .getOne();
            if (!recurrentOrder) {
                throw ApiError_1.default.notFound(`Recurrent order with id ${id}`, `not found`);
            }
            if (recurrentOrder.csrEmail !== ctx.state.user.email) {
                throw ApiError_1.default.accessDenied("You can only view your own orders");
            }
            const orders = yield dataSource.createQueryBuilder()
                .select("orders.*")
                .from(Orders_1.Orders, "orders")
                .innerJoin("RecurrentOrderTemplateOrder", "recurrentOrderTemplateOrder", "recurrentOrderTemplateOrder.orderId = orders.id")
                .where(`recurrentOrderTemplateOrder.recurrentOrderTemplateId = ${id}`)
                .limit(25)
                .offset(0)
                .orderBy("orders.id", "DESC")
                .getRawMany();
            let items = [];
            if (orders && orders.length > 0) {
                for (let index = 0; index < orders.length; index++) {
                    let tmp = {};
                    tmp.id = orders[index].id;
                    tmp.workOrderId = orders[index].work_order_id;
                    tmp.serviceDate = orders[index].service_date;
                    tmp.status = orders[index].status;
                    tmp.billableServiceId = orders[index].billable_service_id;
                    tmp.grandTotal = orders[index].grand_total;
                    tmp.materialId = orders[index].material_id;
                    tmp.businessUnitId = orders[index].business_unit_id;
                    tmp.businessLineId = orders[index].business_line_id;
                    let requestbody = {
                        billableServiceId: orders[index].billable_service_id,
                        businessUnitId: orders[index].business_unit_id,
                        businessLineId: orders[index].business_line_id,
                        materialId: orders[index].material_id,
                        workOrderId: orders[index].work_order_id,
                    };
                    let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
                    tmp.billableService = requestResponse.billableService;
                    tmp.businessUnit = requestResponse.businessUnit;
                    tmp.businessLine = requestResponse.businessLine;
                    tmp.workOrder = requestResponse.workOrder;
                    tmp.material = requestResponse.material;
                    items.push(tmp);
                }
            }
            ctx.body = items;
            ctx.status = 200;
            yield dataSource.destroy();
            return next();
        });
    }
    getRecurrentOrderDetails(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const recurrentOrder = yield dataSource.createQueryBuilder()
                .select("recurrentOrderTemplate")
                .from(RecurrentOrderTemplates_1.RecurrentOrderTemplate, "recurrentOrderTemplate")
                .leftJoinAndMapMany("recurrentOrderTemplate.lineItems", // Row to map the information
            "RecurrentOrderTemplateLineItems", // Entity or table
            "lineItems", // Alias
            "recurrentOrderTemplate.id = lineItems.recurrentOrderTemplateId" //Condition
            )
                .where(`recurrentOrderTemplate.id = ${id}`)
                .getOne();
            if (!recurrentOrder) {
                ctx.body = undefined;
                ctx.status = 404;
                return next();
            }
            let requestbody = {
                businessLineId: recurrentOrder.businessLineId,
                workOrderId: recurrentOrder.workOrderId,
                jobSiteId: recurrentOrder.jobSiteId,
                isRollOff: recurrentOrder.isRollOff,
                customerId: recurrentOrder.customerId,
                billableServiceId: recurrentOrder.billableServiceId,
                materialId: recurrentOrder.materialId,
                equipmentItemId: recurrentOrder.equipmentItemId,
                serviceAreaId: recurrentOrder.serviceAreaId,
                businessUnitId: recurrentOrder.businessUnitId,
                purchaseOrderId: recurrentOrder.purchaseOrderId,
                orderContactId: recurrentOrder.orderContactId,
                jobSiteContactId: recurrentOrder.jobSiteContactId,
                customerJobSiteId: recurrentOrder.customerJobSiteId,
                permitId: recurrentOrder.permitId,
                globalRatesServicesId: recurrentOrder.globalRatesServicesId,
                customRatesGroupServicesId: recurrentOrder.customRatesGroupServicesId,
                customRatesGroupId: recurrentOrder.customRatesGroupId,
                disposalSiteId: recurrentOrder.disposalSiteId,
                materialProfileId: recurrentOrder.materialProfileId,
                projectId: recurrentOrder.projectId,
                thirdPartyHaulerId: recurrentOrder.thirdPartyHaulerId,
                promoId: recurrentOrder.promoId,
            };
            let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
            Object.assign(recurrentOrder, requestResponse);
            for (let index = 0; index < recurrentOrder.lineItems.length; index++) {
                let requestbody2 = {
                    billableLineItemId: recurrentOrder.lineItems[index].billableLineItemId,
                    materialId: recurrentOrder.lineItems[index].materialId,
                    globalRatesLineItemsId: recurrentOrder.lineItems[index].globalRatesLineItemsId,
                };
                let requestResponse2 = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody2 });
                recurrentOrder.lineItems[index].billableLineItem =
                    requestResponse2.billableLineItem;
                recurrentOrder.lineItems[index].material = requestResponse2.material;
                recurrentOrder.lineItems[index].globalRatesLineItem =
                    requestResponse2.globalRatesLineItem;
            }
            if (recurrentOrder.lineItems && recurrentOrder.lineItems.length == 0) {
                delete recurrentOrder.lineItems;
            }
            yield dataSource.destroy();
            ctx.body = recurrentOrder;
            ctx.status = 200;
            return next();
        });
    }
    getDataForGeneration(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const recurrentOrder = yield dataSource.createQueryBuilder()
                .select("recurrentOrderTemplate")
                .from(RecurrentOrderTemplates_1.RecurrentOrderTemplate, "recurrentOrderTemplate")
                .leftJoinAndMapMany("recurrentOrderTemplate.lineItems", // Row to map the information
            "RecurrentOrderTemplateLineItems", // Entity or table
            "lineItems", // Alias
            "recurrentOrderTemplate.id = lineItems.recurrentOrderTemplateId" //Condition
            )
                .where("recurrentOrderTemplate.id = :id", ctx.request.body)
                .getOne();
            yield dataSource.destroy();
            ctx.body = recurrentOrder;
            ctx.status = 200;
            return next();
        });
    }
    getRecurrentOrder(ctx, next) {
        const _super = Object.create(null, {
            getDataBy: { get: () => super.getDataBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, sortBy, sortOrder, customerId, query } = ctx.request.query;
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
                sort = { [tmp]: sortOrder ? sortOrder : "ASC" };
            }
            if (customerId) {
                let customer = yield (0, haulingRequest_1.getCustomerForRecurrentOrder)(ctx, {
                    data: { customerId: customerId },
                });
                where.customerId = customer.id;
            }
            body.where = where;
            body.order = sort;
            ctx.request.body = body;
            let recurrentOrders = yield _super.getDataBy.call(this, ctx, RecurrentOrderTemplates_1.RecurrentOrderTemplate);
            let response = [];
            if (recurrentOrders && recurrentOrders.length > 0) {
                for (let index = 0; index < recurrentOrders.length; index++) {
                    let tmp = {};
                    tmp.callOnWayPhoneNumberId =
                        recurrentOrders[index].callOnWayPhoneNumberId;
                    tmp.textOnWayPhoneNumberId =
                        recurrentOrders[index].textOnWayPhoneNumberId;
                    tmp.purchaseOrderId = recurrentOrders[index].purchaseOrderId;
                    tmp.id = recurrentOrders[index].id;
                    tmp.startDate = recurrentOrders[index].startDate;
                    tmp.endDate = recurrentOrders[index].endDate;
                    tmp.nextServiceDate = recurrentOrders[index].nextServiceDate;
                    tmp.status = recurrentOrders[index].status;
                    tmp.paymentMethod = recurrentOrders[index].paymentMethod;
                    tmp.grandTotal = recurrentOrders[index].grandTotal;
                    tmp.createdAt = recurrentOrders[index].createdAt;
                    tmp.updatedAt = recurrentOrders[index].updatedAt;
                    tmp.frequencyPeriod = recurrentOrders[index].frequencyPeriod;
                    tmp.frequencyType = recurrentOrders[index].frequencyType;
                    tmp.customFrequencyType = recurrentOrders[index].customFrequencyType;
                    tmp.frequencyDays = recurrentOrders[index].frequencyDays;
                    let requestbody = {
                        businessLineId: recurrentOrders[index].businessLineId,
                        workOrderId: recurrentOrders[index].workOrderId,
                        jobSiteId: recurrentOrders[index].jobSiteId,
                        isRollOff: recurrentOrders[index].isRollOff,
                        customerId: recurrentOrders[index].customerId,
                        billableServiceId: recurrentOrders[index].billableServiceId,
                        materialId: recurrentOrders[index].materialId,
                        equipmentItemId: recurrentOrders[index].equipmentItemId,
                        serviceAreaId: recurrentOrders[index].serviceAreaId,
                        businessUnitId: recurrentOrders[index].businessUnitId,
                        purchaseOrderId: recurrentOrders[index].purchaseOrderId,
                        orderContactId: recurrentOrders[index].orderContactId,
                        jobSiteContactId: recurrentOrders[index].jobSiteContactId,
                        customerJobSiteId: recurrentOrders[index].customerJobSiteId,
                        permitId: recurrentOrders[index].permitId,
                        disposalSiteId: recurrentOrders[index].disposalSiteId,
                        materialProfileId: recurrentOrders[index].materialProfileId,
                        projectId: recurrentOrders[index].projectId,
                        thirdPartyHaulerId: recurrentOrders[index].thirdPartyHaulerId,
                        promoId: recurrentOrders[index].promoId,
                    };
                    let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
                    Object.assign(tmp, requestResponse);
                    response.push(tmp);
                }
            }
            if (query) {
                response = response.filter((item) => item.jobSite.address.addressLine1.includes(query) ||
                    item.jobSite.address.city.includes(query) ||
                    item.jobSite.address.state.includes(query) ||
                    item.jobSite.address.zip.includes(query) ||
                    item.frequencyType.includes(query) ||
                    item.status.includes(query) ||
                    item.grandTotal.toString().includes(query));
            }
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    getRecurrentOrderTemplate(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, RecurrentOrderTemplates_1.RecurrentOrderTemplate);
        });
    }
    getRecurrentOrderTemplateBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, RecurrentOrderTemplates_1.RecurrentOrderTemplate);
        });
    }
    addRecurrentOrderTemplate(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, RecurrentOrderTemplates_1.RecurrentOrderTemplate, RecurrentOrderTemplatesHistorical_1.RecurrentOrderTemplateHistorical);
        });
    }
    updateRecurrentOrderTemplate(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            delete ctx.request.body.lineItems;
            return _super.update.call(this, ctx, next, RecurrentOrderTemplates_1.RecurrentOrderTemplate, RecurrentOrderTemplatesHistorical_1.RecurrentOrderTemplateHistorical, id);
        });
    }
    putRecurrentTemplateOnHold(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            let status = { status: orderStatuses_1.RECURRENT_TEMPLATE_STATUS.onHold };
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            dataSource.manager.update(RecurrentOrderTemplates_1.RecurrentOrderTemplate, { id: id }, status);
            yield dataSource.destroy();
            ctx.status = httpStatusCodes_1.default.OK;
            return next();
        });
    }
    putRecurrentTemplateOffHold(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            let status = { status: orderStatuses_1.RECURRENT_TEMPLATE_STATUS.active };
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            dataSource.manager.update(RecurrentOrderTemplates_1.RecurrentOrderTemplate, { id: id }, status);
            yield dataSource.destroy();
            ctx.status = httpStatusCodes_1.default.OK;
            return next();
        });
    }
    closeRecurrentOrderTemplate(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            let status = { status: orderStatuses_1.RECURRENT_TEMPLATE_STATUS.closed };
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const recurrentOrder = yield dataSource.createQueryBuilder()
                .select("recurrentOrderTemplateOrder")
                .from(RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder, "recurrentOrderTemplateOrder")
                .innerJoin("Orders", "orders", "orders.id = recurrentOrderTemplateOrder.orderId")
                .where("recurrentOrderTemplateOrder.recurrentOrderTemplateId = :id", ctx.request.body)
                .andWhere("orders.status IN (:...status)", {
                status: [
                    orderStatuses_1.ORDER_STATUS.inProgress,
                    orderStatuses_1.ORDER_STATUS.completed,
                    orderStatuses_1.ORDER_STATUS.approved,
                ],
            })
                .getCount();
            if (recurrentOrder > 0) {
                throw ApiError_1.default.invalidRequest("There are not finalized orders created for the recurrent order.", "Please finalize or cancel them");
            }
            dataSource.manager.update(RecurrentOrderTemplates_1.RecurrentOrderTemplate, { id: id }, status);
            yield dataSource.destroy();
            ctx.status = httpStatusCodes_1.default.OK;
            return next();
        });
    }
    deleteRecurrentOrderTemplate(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, RecurrentOrderTemplates_1.RecurrentOrderTemplate, RecurrentOrderTemplatesHistorical_1.RecurrentOrderTemplateHistorical);
        });
    }
    getCount(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { customerId } = ctx.request.query;
            let response = { total: 0 };
            let id = 0;
            if (customerId) {
                let customer = yield (0, haulingRequest_1.getCustomerForRecurrentOrder)(ctx, {
                    data: { customerId: +customerId },
                });
                id = customer.id;
            }
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const countRecurrentOrders = yield dataSource.createQueryBuilder()
                .select("recurrentOrderTemplate")
                .from(RecurrentOrderTemplates_1.RecurrentOrderTemplate, "recurrentOrderTemplate")
                .where(`recurrentOrderTemplate.customerId = ${id}`)
                .groupBy("recurrentOrderTemplate.id")
                .getCount();
            yield dataSource.destroy();
            response.total = countRecurrentOrders;
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
}
exports.RecurrentOrderTemplateController = RecurrentOrderTemplateController;
//# sourceMappingURL=recurrentOrderTemplate.controller.js.map