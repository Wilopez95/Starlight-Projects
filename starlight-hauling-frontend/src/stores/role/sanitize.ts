import { FormRole } from '@root/quickViews/RoleQuickView/formikData';
import { UserManagementStatus } from '@root/types';

export const sanitizeRole = (role: FormRole) => ({
  ...role,
  active: undefined,
  policies: role.policies.map(({ resource, access }) => ({
    resource,
    entries: Object.entries(access).map(([subject, config]) => ({ subject, ...config })),
  })),
  policyTemplates: role.policyTemplates.map(({ resourceType, access }) => ({
    resourceType,
    entries: Object.entries(access).map(([subject, config]) => ({ subject, ...config })),
  })),
  status: role.active ? UserManagementStatus.ACTIVE : UserManagementStatus.DISABLED,
});
