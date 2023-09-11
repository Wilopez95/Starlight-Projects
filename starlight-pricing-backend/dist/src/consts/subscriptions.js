"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_METHODS = exports.NO_PAYMENT = exports.SUBSCRIPTION_STATUS = exports.PAYMENT_METHOD = exports.BILLING_TYPES_VALUES = exports.BILLING_TYPES = exports.BILLABLE_ITEMS_BILLING_CYCLES = exports.BILLABLE_ITEMS_BILLING_CYCLE = exports.EQUIPMENT_TYPES = exports.EQUIPMENT_TYPE = void 0;
exports.EQUIPMENT_TYPE = {
    rollOffContainer: "rolloff_container",
    wasteContainer: "waste_container",
    portableToilet: "portable_toilet",
    unspecified: "unspecified",
};
exports.EQUIPMENT_TYPES = Object.values(exports.EQUIPMENT_TYPE);
exports.BILLABLE_ITEMS_BILLING_CYCLE = {
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    "28days": "28days",
    quarterly: "quarterly",
    yearly: "yearly",
};
exports.BILLABLE_ITEMS_BILLING_CYCLES = Object.values(exports.BILLABLE_ITEMS_BILLING_CYCLE);
exports.BILLING_TYPES = {
    arrears: "arrears",
    inAdvance: "inAdvance",
};
exports.BILLING_TYPES_VALUES = Object.values(exports.BILLING_TYPES);
exports.PAYMENT_METHOD = {
    onAccount: "onAccount",
    creditCard: "creditCard",
    cash: "cash",
    check: "check",
    mixed: "mixed",
};
exports.SUBSCRIPTION_STATUS = {
    active: 'active',
    onHold: 'onHold',
    closed: 'closed',
    draft: 'draft',
};
// Only used in filters
exports.NO_PAYMENT = "noPayment";
exports.PAYMENT_METHODS = Object.values(exports.PAYMENT_METHOD);
//# sourceMappingURL=subscriptions.js.map