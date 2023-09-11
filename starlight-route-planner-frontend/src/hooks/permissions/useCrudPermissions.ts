import { Permission } from './types';
import { usePermission } from './usePermission';

type Prefix = 'routePlanner';
type Entity = 'master-routes' | 'daily-routes' | 'dashboard' | 'work-orders-list';

export const useCrudPermissions = (prefix: Prefix, entity: Entity) => {
  const canView = usePermission(`${prefix}:${entity}:view` as Permission);
  const canList = usePermission(`${prefix}:${entity}:list` as Permission);
  const canEdit = usePermission(`${prefix}:${entity}:update` as Permission);
  // const canDelete = usePermission(`${prefix}:${entity}:delete` as Permission);
  // const canCreate = usePermission(`${prefix}:${entity}:create` as Permission);
  const hasFullAccess = usePermission(`${prefix}:${entity}:full-access` as Permission);

  const hasViewAccess = canView && canList;
  const hasModifyAccess = canEdit;
  // const hasFullAccess = canDelete && canCreate;

  return {
    hasViewAccess,
    hasModifyAccess,
    hasFullAccess,
  };
};
