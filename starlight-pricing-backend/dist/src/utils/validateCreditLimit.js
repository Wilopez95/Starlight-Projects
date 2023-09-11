"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCreditLimit = void 0;
const subscriptionErrorMessages_js_1 = require("../errors/subscriptionErrorMessages.js");
const ApiError_js_1 = require("../utils/ApiError.js");
const validateCreditLimit = (data, availableCredit, priceDifference) => {
    if (!data.overrideCreditLimit && availableCredit < (priceDifference !== null && priceDifference !== void 0 ? priceDifference : data.grandTotal)) {
        throw ApiError_js_1.default.paymentRequired(subscriptionErrorMessages_js_1.creditLimitExceededMessage, {});
    }
};
exports.validateCreditLimit = validateCreditLimit;
//# sourceMappingURL=validateCreditLimit.js.map