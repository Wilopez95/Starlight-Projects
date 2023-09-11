"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableCredit = void 0;
const makeRequest_1 = require("../utils/makeRequest");
const getAvailableCredit = (ctx, { customerId }) => (0, makeRequest_1.makeBillingRequest)(ctx, {
    method: 'get',
    url: `/customers/${customerId}/available-credit`,
});
exports.getAvailableCredit = getAvailableCredit;
//# sourceMappingURL=billing.js.map