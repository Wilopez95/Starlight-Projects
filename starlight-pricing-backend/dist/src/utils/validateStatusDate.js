"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStatusDate = void 0;
const orderStatuses_1 = require("../consts/orderStatuses");
const validateStatusDate = (status, data) => {
    switch (status) {
        case orderStatuses_1.SUBSCRIPTION_ORDER_STATUS.canceled:
            data.canceledAt = new Date();
            break;
        case orderStatuses_1.SUBSCRIPTION_ORDER_STATUS.completed:
            data.completedAt = new Date();
            break;
        case orderStatuses_1.SUBSCRIPTION_ORDER_STATUS.invoiced:
            data.paidAt = new Date();
            break;
    }
    return data;
};
exports.validateStatusDate = validateStatusDate;
//# sourceMappingURL=validateStatusDate.js.map