"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobSiteSearchQuery = exports.haulingGetCustomersByIds = exports.haulingBillableLineItemBillingCycleRepo = exports.haulingBillableServiceFrequencyRepo = void 0;
const makeRequest_1 = require("../utils/makeRequest");
const haulingBillableServiceFrequencyRepo = (ctx, data) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "post",
    url: `/api/v1/rates/custom/duplicate/billableServiceFrequency`,
    data,
});
exports.haulingBillableServiceFrequencyRepo = haulingBillableServiceFrequencyRepo;
const haulingBillableLineItemBillingCycleRepo = (ctx, data) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "post",
    url: `/api/v1/rates/custom/duplicate/billableLineItemBillingCycle`,
    data,
});
exports.haulingBillableLineItemBillingCycleRepo = haulingBillableLineItemBillingCycleRepo;
const haulingGetCustomersByIds = (ctx, data) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "post",
    url: `/api/v1/customers/getByIds`,
    data,
});
exports.haulingGetCustomersByIds = haulingGetCustomersByIds;
const getJobSiteSearchQuery = (ctx, { data }) => (0, makeRequest_1.makeHaulingRequest)(ctx, {
    method: "get",
    url: `/api/v1/subscriptions/query-search`,
    data,
});
exports.getJobSiteSearchQuery = getJobSiteSearchQuery;
//# sourceMappingURL=hauling.js.map