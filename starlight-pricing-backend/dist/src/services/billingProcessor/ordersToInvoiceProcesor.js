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
exports.getSubscriptionsToInvoice = exports.getOrdersToInvoice = void 0;
const haulingRequest_1 = require("../../request/haulingRequest");
const typeorm_1 = require("typeorm");
const base_controller_1 = require("../../controllers/base.controller");
const Orders_1 = require("../../database/entities/tenant/Orders");
const Subscriptions_1 = require("../../database/entities/tenant/Subscriptions");
const SubscriptionServiceItem_1 = require("../../database/entities/tenant/SubscriptionServiceItem");
const getOrdersToInvoice = (ctx, count = false) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const condition = ctx.request.body;
    if (condition.billingDate) {
        const { billingDate: serviceDay } = condition;
        delete condition.billingDate;
        condition.endingDate = serviceDay;
    }
    const { businessUnitId } = ctx.request.query;
    if (condition.arrears !== undefined && !condition.arrears && count) {
        return 0;
    }
    if (condition.isWithSubs && !((_a = condition.filterByBusinessLine) === null || _a === void 0 ? void 0 : _a.length) && count) {
        return 0;
    }
    let whereFilter1 = { businessUnitId: businessUnitId, status: "finalized" };
    let whereFilter2 = { serviceDate: (0, typeorm_1.LessThanOrEqual)(condition.endingDate) };
    let whereFilter3 = condition.customerId
        ? { originalCustomerId: condition.customerId }
        : condition.customerGroupId
            ? { customerGroupId: condition.customerGroupId }
            : {};
    let whereFilter4 = {};
    let paymentMethodList = [];
    if (condition.onAccount) {
        paymentMethodList.push("onAccount");
    }
    if (condition.prepaid) {
        paymentMethodList.push("prepaid");
    }
    if (condition.onAccount || condition.prepaid) {
        whereFilter4 = { paymentMethod: (0, typeorm_1.In)(paymentMethodList) };
    }
    let ordersToInvoice;
    let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
    if (count) {
        ordersToInvoice = yield dataSource.manager
            .createQueryBuilder()
            .select("orders")
            .from(Orders_1.Orders, "orders")
            .where(whereFilter1)
            .andWhere(whereFilter2)
            .andWhere(whereFilter3)
            .andWhere(whereFilter4)
            .getCount();
    }
    else {
        const listOfOrdersToInvoice = yield dataSource.manager
            .createQueryBuilder()
            .select("orders")
            .from(Orders_1.Orders, "orders")
            .where(whereFilter1)
            .andWhere(whereFilter2)
            .andWhere(whereFilter3)
            .andWhere(whereFilter4)
            .getMany();
        if (listOfOrdersToInvoice && listOfOrdersToInvoice.length > 0) {
            for (let i = 0; i < listOfOrdersToInvoice.length; i++) {
                let requestData = {
                    businessLineId: listOfOrdersToInvoice[i].businessLineId,
                    jobSiteId: listOfOrdersToInvoice[i].jobSiteId,
                    billableServiceId: listOfOrdersToInvoice[i].billableServiceId,
                    materialId: listOfOrdersToInvoice[i].materialId,
                    equipmentItemId: listOfOrdersToInvoice[i].equipmentItemId,
                    customerJobSiteId: listOfOrdersToInvoice[i].customerJobSiteId,
                };
                let orderData = yield (0, haulingRequest_1.getOrderData)(ctx, {
                    data: requestData,
                });
                Object.assign(listOfOrdersToInvoice[i], orderData);
            }
            ordersToInvoice = listOfOrdersToInvoice;
        }
        else {
            ordersToInvoice = [];
        }
    }
    yield dataSource.destroy();
    return ordersToInvoice;
});
exports.getOrdersToInvoice = getOrdersToInvoice;
const getJobSiteAddressFormat = ({ jobSite }) => {
    return {
        id: jobSite.originalId,
        zip: jobSite.address.zip,
        city: jobSite.address.city,
        state: jobSite.address.state,
        fullAddress: jobSite.fullAddress,
        addressLine1: jobSite.address.addressLine1,
        addressLine2: jobSite.address.addressLine2,
    };
};
const getSubscriptionsToInvoice = (ctx, count = false) => __awaiter(void 0, void 0, void 0, function* () {
    const condition = ctx.request.body;
    if (condition.billingDate) {
        const { billingDate: serviceDay } = condition;
        delete condition.billingDate;
        condition.endingDate = serviceDay;
    }
    const { businessUnitId } = ctx.request.query;
    let whereFilter = { businessUnitId: businessUnitId, status: (0, typeorm_1.In)(["active", "closed"]) };
    let subWhereFilter1 = {};
    let subWhereFilter2 = {};
    let subWhereFilter3 = {};
    let subWhereFilter4 = {};
    let subWhereFilter5 = {};
    let subWhereFilter6 = {};
    let subWhereFilter7 = {};
    if (condition.businessLineIds.length > 0) {
        whereFilter = Object.assign(Object.assign({}, whereFilter), { businessLineId: (0, typeorm_1.In)(condition.businessLineIds) });
    }
    if (condition.billingCycles.length > 0) {
        whereFilter = Object.assign(Object.assign({}, whereFilter), { billingCycle: (0, typeorm_1.In)(condition.billingCycles) });
    }
    const isBillingType = condition.arrears || condition.inAdvance;
    if (isBillingType) {
        if (condition.arrears) {
            subWhereFilter1 = { billingType: "arrears" };
            subWhereFilter2 = [{ nextBillingPeriodTo: (0, typeorm_1.LessThan)(condition.endingDate) }];
            subWhereFilter3 = [{ nextBillingPeriodTo: (0, typeorm_1.IsNull)(), status: (0, typeorm_1.In)(["FINALIZED", "CANCELED"]) }];
        }
        if (condition.inAdvance) {
            subWhereFilter4 = { nextBillingPeriodTo: (0, typeorm_1.Not)((0, typeorm_1.MoreThan)(condition.endingDate)) };
            subWhereFilter5 = [{ nextBillingPeriodTo: (0, typeorm_1.IsNull)(), status: (0, typeorm_1.In)(["FINALIZED", "CANCELED"]) }];
            subWhereFilter6 = { billingType: "inAdvance" };
        }
    }
    if (condition.customerId) {
        subWhereFilter7 = { customerId: condition.customerId };
    }
    else {
        if (condition.customerGroupId) {
            subWhereFilter7 = { customerGroupId: condition.customerGroupId };
        }
    }
    let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
    let subscriptionsToInvoice;
    if (count) {
        subscriptionsToInvoice = yield dataSource.manager
            .createQueryBuilder()
            .select("subscription")
            .from(Subscriptions_1.Subscriptions, "subscription")
            .where(whereFilter)
            .andWhere(new typeorm_1.Brackets((qb) => {
            qb.where(subWhereFilter1)
                .andWhere(new typeorm_1.Brackets((qb) => {
                qb.where(subWhereFilter2).orWhere(new typeorm_1.Brackets((qb) => {
                    qb.where(subWhereFilter3);
                }));
            }))
                .orWhere(new typeorm_1.Brackets((qb) => {
                qb.where(new typeorm_1.Brackets((qb) => {
                    qb.where(subWhereFilter4).orWhere(new typeorm_1.Brackets((qb) => {
                        qb.andWhere(subWhereFilter5);
                    }));
                })).andWhere(subWhereFilter6);
            }));
        }))
            .andWhere(subWhereFilter7)
            .getCount();
    }
    else {
        subscriptionsToInvoice = yield dataSource.manager
            .createQueryBuilder()
            .select("subscription")
            .from(Subscriptions_1.Subscriptions, "subscription")
            .where(whereFilter)
            .andWhere(new typeorm_1.Brackets((qb) => {
            qb.where(subWhereFilter1)
                .andWhere(new typeorm_1.Brackets((qb) => {
                qb.where(subWhereFilter2).orWhere(new typeorm_1.Brackets((qb) => {
                    qb.where(subWhereFilter3);
                }));
            }))
                .orWhere(new typeorm_1.Brackets((qb) => {
                qb.where(new typeorm_1.Brackets((qb) => {
                    qb.where(subWhereFilter4).orWhere(new typeorm_1.Brackets((qb) => {
                        qb.andWhere(subWhereFilter5);
                    }));
                })).andWhere(subWhereFilter6);
            }));
        }))
            .andWhere(subWhereFilter7)
            .getMany();
        if (subscriptionsToInvoice && subscriptionsToInvoice.length) {
            for (let index in subscriptionsToInvoice) {
                let requestData = {
                    jobSiteId: subscriptionsToInvoice[index].jobSiteId,
                };
                let orderData = yield (0, haulingRequest_1.getOrderData)(ctx, {
                    data: requestData,
                });
                subscriptionsToInvoice[index].jobSiteAddress = getJobSiteAddressFormat(orderData);
                const lineItems = yield dataSource.manager
                    .createQueryBuilder()
                    .select("subscriptionServiceItem")
                    .from(SubscriptionServiceItem_1.SubscriptionServiceItem, "subscriptionServiceItem")
                    .where({ subscriptionId: subscriptionsToInvoice[index].id })
                    .getMany();
                if (lineItems.length) {
                    for (let lineItem in lineItems) {
                        let requestbillableData = {
                            billableServiceId: lineItems[lineItem].billableServiceId,
                        };
                        let { billableService } = yield (0, haulingRequest_1.getOrderData)(ctx, {
                            data: requestbillableData,
                        });
                        const serviceName = { serviceName: billableService.description };
                        Object.assign(lineItems[lineItem], serviceName);
                    }
                }
                subscriptionsToInvoice[index].serviceItems = lineItems;
            }
        }
    }
    yield dataSource.destroy();
    return subscriptionsToInvoice;
});
exports.getSubscriptionsToInvoice = getSubscriptionsToInvoice;
//# sourceMappingURL=ordersToInvoiceProcesor.js.map