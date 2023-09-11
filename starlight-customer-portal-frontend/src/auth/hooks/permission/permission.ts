import { CurrentUser } from '@root/auth/types';
import { useUserContext } from '@root/core/hooks';

import { Action, EntityName } from './types';

export const namespace = 'customer-portal';

export const userHasPermission = (user: CurrentUser, permissions: string[]): boolean => {
  return permissions.some((permission) => user?.permissions.has(permission));
};

export const useEntityPermission = (entity: EntityName, action: Action | Action[]): boolean => {
  const actions = typeof action === 'string' ? [action] : action;
  const { currentUser } = useUserContext();

  return (
    !!currentUser &&
    userHasPermission(
      currentUser,
      actions.map((action) => `${namespace}:${entity}:${action}`),
    )
  );
};

/**
 * Array argument means user has to have at list one permission of provided values
 * @param permission
 */
export const usePermission = (permission: string | string[]) => {
  const { currentUser } = useUserContext();
  const permissions = typeof permission === 'string' ? [permission] : permission;

  return currentUser && userHasPermission(currentUser, permissions);
};
