export const NON_TENANT_INDEX = {
  administrative: 'administrative',
  recyclingFacilities: 'recycling_facilities',
};

export const TENANT_INDEX = {
  customers: 'customers',
  jobSites: 'job_sites',
  auditLogs: 'audit_logs',
  subscriptions: 'subscriptions',
};

export const TENANT_INDICES = Object.values(TENANT_INDEX);

export const NON_TENANT_INDICES = Object.values(NON_TENANT_INDEX);
