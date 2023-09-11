import { PermissionUserOrRoleFilter } from '../../input/PermissionUserOrRoleFilter';

export interface GetUsersAndCountFilterConfig {
  tenantName?: string;
  roleOrUserPermissionsFilters?: PermissionUserOrRoleFilter[];
  query?: string;
  resource?: string;
}
