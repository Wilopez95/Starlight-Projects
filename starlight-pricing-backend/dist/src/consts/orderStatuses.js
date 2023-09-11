"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECURRENT_TEMPLATE_STATUS = exports.SUBSCRIPTION_ORDER_STATUSES = exports.SUBSCRIPTION_ORDER_STATUS = exports.ORDER_STATUSES = exports.ORDER_STATUS = void 0;
exports.ORDER_STATUS = {
    inProgress: "inProgress",
    completed: "completed",
    approved: "approved",
    finalized: "finalized",
    canceled: "canceled",
    invoiced: "invoiced",
};
exports.ORDER_STATUSES = Object.values(exports.ORDER_STATUS);
// need this exact order for sorting purposes
exports.SUBSCRIPTION_ORDER_STATUS = {
    scheduled: "SCHEDULED",
    inProgress: "IN_PROGRESS",
    blocked: "BLOCKED",
    skipped: "SKIPPED",
    completed: "COMPLETED",
    approved: "APPROVED",
    canceled: "CANCELED",
    finalized: "FINALIZED",
    invoiced: "INVOICED",
    needsApproval: "NEEDS_APPROVAL",
};
exports.SUBSCRIPTION_ORDER_STATUSES = Object.values(exports.SUBSCRIPTION_ORDER_STATUS);
exports.RECURRENT_TEMPLATE_STATUS = {
    active: "active",
    onHold: "onHold",
    closed: "closed",
};
//# sourceMappingURL=orderStatuses.js.map