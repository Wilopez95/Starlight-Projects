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
exports.SubscriptionsRespository = void 0;
const SubscriptionOrders_1 = require("../../database/entities/tenant/SubscriptionOrders");
const haulingRequest_1 = require("./../../request/haulingRequest");
const subscriptionServiceName_1 = require("../../utils/subscriptionServiceName");
const SubscriptionServiceItem_1 = require("../../database/entities/tenant/SubscriptionServiceItem");
const typeorm_1 = require("typeorm");
const base_controller_1 = require("../../controllers/base.controller");
class SubscriptionsRespository extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    extendSubscription(ctx, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = [];
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
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
                let serviceItems = yield dataSource.manager
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
                let serviceData = yield dataSource
                    .createQueryBuilder()
                    .select("subsOrders")
                    .from(SubscriptionOrders_1.SubscriptionOrders, "subsOrders")
                    .leftJoinAndMapOne("subsOrders.tempNextServiceDate", "SubscriptionServiceItem", "subServiceItem", "subsOrders.subscriptionServiceItemId = subServiceItem.id")
                    .where({ subscriptionId: elementSubs.id })
                    .getMany();
                const nextServiceDate = (_a = serviceData.find((servicedate) => (servicedate.tempNextServiceDate.id = elementSubs.id))) === null || _a === void 0 ? void 0 : _a.serviceDate;
                return Object.assign(Object.assign({}, elementSubs), { serviceArea: haulingData.serviceArea, jobSite: haulingData.jobSite, customer: haulingData.customer, businessLine: haulingData.businessLine, businessUnit: haulingData.businessUnit, nextServiceDate: nextServiceDate });
            })));
            yield dataSource.destroy();
            return response;
        });
    }
    extendSubscriptionTenant(ctx, data, tenantName) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = [];
            let dataSource = yield base_controller_1.BaseController.getDataSource(tenantName);
            response = yield Promise.all(data.map((elementSubs) => __awaiter(this, void 0, void 0, function* () {
                elementSubs.businessUnitId = elementSubs.business_line_id;
                elementSubs.businessLineId = elementSubs.business_unit_id;
                let serviceItems = yield dataSource.manager
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
                for (let index = 0; index < serviceItems.length; index++) {
                    const element = serviceItems[index];
                    let ids = [];
                    let requestbody = {
                        billableServiceId: element.billableServiceId,
                    };
                    if (serviceItems[index].serviceFrequencyId) {
                        ids.push(serviceItems[index].serviceFrequencyId);
                        requestbody.frequencyIds = ids;
                    }
                    const serviceItemsData = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
                    element.billableService = serviceItemsData.billableService;
                    if (serviceItemsData.frequencies) {
                        element.serviceFrequency = serviceItemsData.frequencies;
                        elementSubs.serviceFrequencyAggregated = serviceItemsData.frequencies[0];
                    }
                }
                elementSubs.serviceName = (0, subscriptionServiceName_1.subscriptionServiceName)(serviceItems);
                elementSubs.serviceItems = serviceItems;
                return elementSubs;
            })));
            yield dataSource.destroy();
            return response;
        });
    }
}
exports.SubscriptionsRespository = SubscriptionsRespository;
//# sourceMappingURL=repository.js.map