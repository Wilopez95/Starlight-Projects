"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionServiceName = void 0;
const subscriptionServiceName = (services) => { var _a, _b; return ((services === null || services === void 0 ? void 0 : services.length) > 1 ? 'Multiple' : ((_b = (_a = services[0]) === null || _a === void 0 ? void 0 : _a.billableService) === null || _b === void 0 ? void 0 : _b.description) || '-'); };
exports.subscriptionServiceName = subscriptionServiceName;
//# sourceMappingURL=subscriptionServiceName.js.map