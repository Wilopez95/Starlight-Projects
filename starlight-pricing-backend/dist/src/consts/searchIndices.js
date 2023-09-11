"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NON_TENANT_INDICES = exports.TENANT_INDICES = exports.TENANT_INDEX = exports.NON_TENANT_INDEX = void 0;
exports.NON_TENANT_INDEX = {
    administrative: 'administrative',
    recyclingFacilities: 'recycling_facilities',
};
exports.TENANT_INDEX = {
    customers: 'customers',
    jobSites: 'job_sites',
    auditLogs: 'audit_logs',
    subscriptions: 'subscriptions',
};
exports.TENANT_INDICES = Object.values(exports.TENANT_INDEX);
exports.NON_TENANT_INDICES = Object.values(exports.NON_TENANT_INDEX);
//# sourceMappingURL=searchIndices.js.map