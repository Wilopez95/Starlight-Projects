import { Permission } from './types';
import { usePermission } from './usePermission';

// TODO: provide stronger typing for available prefixes and entities
type Prefix = 'configuration' | 'configuration/price-groups' | 'subscriptions';
type Entity =
  | 'price-groups'
  | 'customer-groups'
  | 'disposal-sites'
  | 'company-settings'
  | 'brokers'
  | 'business-units'
  | 'permits'
  | 'tax-districts'
  | 'promos'
  | 'service-areas'
  | 'users'
  | 'roles'
  | 'materials'
  | 'equipment'
  | 'material-profiles'
  | 'billable-items'
  | 'third-party-haulers'
  | 'drivers-trucks'
  | 'all'
  | 'own'
  | 'inventory'
  | 'operating-costs'
  | 'change-reasons';

export const useCrudPermissions = (prefix: Prefix, entity: Entity): [boolean, boolean, boolean] => {
  const canView = usePermission(`${prefix}:${entity}:view` as Permission);
  const canList = usePermission(`${prefix}:${entity}:list` as Permission);
  const canEdit = usePermission(`${prefix}:${entity}:update` as Permission);
  const canDelete = usePermission(`${prefix}:${entity}:delete` as Permission);
  const canCreate = usePermission(`${prefix}:${entity}:create` as Permission);

  const hasViewAccess = canView && canList;
  const hasModifyAccess = canEdit;
  const hasFullAccess = canDelete && canCreate;

  return [hasViewAccess, hasModifyAccess, hasFullAccess];
};
