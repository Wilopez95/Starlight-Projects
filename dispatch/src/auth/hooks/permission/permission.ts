/* eslint-disable @typescript-eslint/no-explicit-any */
import { useUserContext } from '../useUserContext';
export const userHasPermission = (
  user: any,
  permissions: string[],
): boolean => {
  return (
    user && permissions.some(permission => user?.permissions.has(permission))
  );
};

/**
 * Array argument means user has to have at list one permission of provided values
 * @param permission
 */
export const usePermission = (permission: string | string[]) => {
  const { currentUser } = useUserContext();
  const permissions =
    typeof permission === 'string' ? [permission] : permission;

  return currentUser && userHasPermission(currentUser, permissions);
};
