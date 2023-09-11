import { FC, ReactElement } from 'react';
import { isArray, isEmpty, compact } from 'lodash-es';
import minimatch from 'minimatch';
import { useGetGrantedPermissionsQuery } from '../../graphql/api';

export type RequiredPermissionItem = string[] | string;

export interface ProtectedProps {
  /**
   * Fallback component when permission check failes
   */
  fallback?: JSX.Element;

  /**
   * Usage:
   * if not sepecified, will only check for existance of user token
   * "some action" - Must have "some action" in permissions
   * ['some action', 'another action'] - Must have ('some action' || 'another action') in permissions
   * [['this action', 'and this action'], 'other action'] - Must have ('this action' && 'and this action') in permissions
   * [['this action', 'and this action'], 'other action'] - Must have ('this action' && 'and this action' || 'other action' in permissions
   */
  permissions?: RequiredPermissionItem[] | RequiredPermissionItem;
}

export interface ProtectedHookOptions {
  permissions?: RequiredPermissionItem[] | RequiredPermissionItem;
}

export const checkPermissions = (
  availablePermissions: string[] = [],
  requiredPermissions: RequiredPermissionItem[] = [],
): boolean => {
  return !!requiredPermissions.some((requiredPermission) => {
    if (isArray(requiredPermission)) {
      return !!(requiredPermission as []).every((requiredPermission) => {
        return !!availablePermissions.some((availablePermission) => {
          // first arg is value, second is a pattern;
          return minimatch(requiredPermission, availablePermission);
        });
      });
    }

    return !!availablePermissions.some((availablePermission) => {
      if (availablePermission.indexOf(requiredPermission) === 0) {
        return true;
      }

      // first arg is value, second is a pattern;
      return minimatch(requiredPermission, availablePermission);
    });
  });
};

/**
 * Check if user has permissions to perform action
 * @param ProtectedHookOptions options
 * @returns boolean
 * */
export const useProtected = ({ permissions }: ProtectedHookOptions): boolean => {
  const { data } = useGetGrantedPermissionsQuery();

  // if there is no token
  if (!data || !data?.userInfo?.token) {
    return false;
  }

  const availablePermissions = (data.userInfo.permissions as string[]) || [];
  const requiredPermissions = compact(isArray(permissions) ? permissions : [permissions]);

  // if there is a token but no specified permissions
  if (isEmpty(requiredPermissions)) {
    return true;
  }

  return checkPermissions(availablePermissions, requiredPermissions as RequiredPermissionItem[]);
};

/**
 *
 * Usage:
 * <Protected /> - Must be logged in with token
 */
export const Protected: FC<ProtectedProps> = ({
  children,
  permissions = [],
  fallback = null,
}): ReactElement<any, any> | null => {
  const { data } = useGetGrantedPermissionsQuery();

  // if there is no token
  if (!data || !data?.userInfo?.token) {
    return fallback;
  }

  const availablePermissions = (data.userInfo.permissions as string[]) || [];
  const requiredPermissions = [...(isArray(permissions) ? permissions : [permissions])].filter(
    (p) => !!p,
  );

  // if there is a token but no specified permissions
  if (isEmpty(requiredPermissions)) {
    return children as ReactElement<any, any>;
  }

  if (checkPermissions(availablePermissions, requiredPermissions)) {
    return children as ReactElement<any, any>;
  }

  return fallback;
};
