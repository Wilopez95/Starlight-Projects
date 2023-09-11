"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchUpdateSubscriptionOrder = exports.getBillableSurcharges = exports.getCustomGroupRatesSurcharges = exports.getGlobalRatesSurcharges = exports.getGlobalRatesServices = exports.getBillableServiceBySubscription = exports.getJobSiteData = exports.getCustomerForRecurrentOrder = exports.getOrderData = exports.getOrders = void 0;
const makeRequest_1 = require("../utils/makeRequest");
const getOrders = (ctx) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/orders?limit=25&skip=0&sortBy=id&sortOrder=desc&finalizedOnly=false&businessUnitId=1&mine=true&status=inProgress`,
});
exports.getOrders = getOrders;
const getOrderData = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/orders/data`,
    data,
});
exports.getOrderData = getOrderData;
const getCustomerForRecurrentOrder = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/recurrent-orders/getCustomerForRecurrentOrder`,
    data,
});
exports.getCustomerForRecurrentOrder = getCustomerForRecurrentOrder;
const getJobSiteData = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/orders/jobSiteData`,
    data,
});
exports.getJobSiteData = getJobSiteData;
const getBillableServiceBySubscription = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/orders/billableServiceBySubscription `,
    data,
});
exports.getBillableServiceBySubscription = getBillableServiceBySubscription;
const getGlobalRatesServices = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/rates/global/services`,
    data,
});
exports.getGlobalRatesServices = getGlobalRatesServices;
const getGlobalRatesSurcharges = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/rates/global/surchargesBy`,
    data,
});
exports.getGlobalRatesSurcharges = getGlobalRatesSurcharges;
const getCustomGroupRatesSurcharges = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/rates/custom/surchargesBy`,
    data,
});
exports.getCustomGroupRatesSurcharges = getCustomGroupRatesSurcharges;
const getBillableSurcharges = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/billable/surcharges`,
    data,
});
exports.getBillableSurcharges = getBillableSurcharges;
const batchUpdateSubscriptionOrder = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "patch",
    url: `/api/v1/subscriptions/orders/batch`,
    data,
});
exports.batchUpdateSubscriptionOrder = batchUpdateSubscriptionOrder;
//# sourceMappingURL=haulingRequest.js.map