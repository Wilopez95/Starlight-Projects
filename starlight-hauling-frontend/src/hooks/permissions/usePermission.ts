import { useUserContext } from '../useUserContext';

import { Permission } from './types';

export const usePermission = (requiredPermissions: Permission | Permission[]): boolean => {
  const { currentUser } = useUserContext();

  if (!currentUser) {
    return false;
  }

  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return permissions.some(availablePermission => currentUser.permissions.has(availablePermission));
};
