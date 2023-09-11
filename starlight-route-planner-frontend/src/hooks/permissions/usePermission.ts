import { useUserContext } from '../useUserContext';

import { Permission } from './types';

export const usePermission = (requiredPermissions: Permission | Permission[]): boolean => {
  const { currentUser } = useUserContext();

  if (!currentUser) {
    return false;
  }

  const requiredPermissionsArray: string[] = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  const userPermissions = Array.from(currentUser.permissions);

  const isPresent = requiredPermissionsArray.some(element => userPermissions.includes(element));

  return isPresent;
};
