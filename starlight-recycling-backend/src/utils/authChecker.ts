import { ResolverData } from 'type-graphql';
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage';
import { isEmpty, merge } from 'lodash';
import minimatch from 'minimatch';
import Me from '../types/Me';
import { Context } from '../types/Context';

import { PERMISSION_REGEXP } from '../constants/regex';

export const checkPermissions = (user: Me, permissions: string[] = []): boolean => {
  if (permissions.length === 0) {
    return true;
  }

  return permissions.some((permission) => user.permissions.includes(permission));
};

export const compilePermissions = (
  userInfo: Me,
  requiredPermissions: string[] = [],
): Record<string, unknown> | null => {
  let permissionsParams = {};

  const hasMatch = requiredPermissions.every((requiredPermission) => {
    return !!userInfo.permissions.find((availablePermission) => {
      const match = PERMISSION_REGEXP.exec(availablePermission);

      if (match) {
        const [, permission, argsString] = match;

        if (permission && argsString) {
          if (minimatch(requiredPermission, permission)) {
            const argsStrings = argsString.replace(/[\(\)]/g, '').split(',');

            permissionsParams = argsStrings.reduce((acc: { [key: string]: string }, argStr) => {
              const arg = argStr.split(':');
              const key = arg[0].trim();
              const value = decodeURIComponent(arg[1].trim());

              switch (key) {
                case 'accessTokenKey': {
                  const keyMapping = value.split('|');

                  if (keyMapping.length > 1) {
                    const userinfoValue = userInfo[keyMapping[0] as keyof Me];

                    if (userinfoValue) {
                      acc[keyMapping[1]] = '' + userinfoValue;
                    }
                  }

                  break;
                }

                default:
                  acc[key] = value;
              }

              return acc;
            }, {});

            return true;
          }

          return false;
        }
      }

      // first arg is value, second is a pattern;
      try {
        return minimatch(requiredPermission, availablePermission) && {};
      } catch (e) {
        throw e;
      }
    });
  });

  if (hasMatch) {
    return permissionsParams;
  }

  return null;
};

export const authChecker = async (
  resolverData: ResolverData<Context>,
  permissions: string[],
): Promise<boolean> => {
  const { context, args } = resolverData;
  let paramsTarget: string;

  if (context.isWorker) {
    return true;
  }

  if (!context.userInfo && !context.serviceToken) {
    throw new Error('Access denied! You need to be authorized to perform this action!');
  }

  // TODO this is a temporary fix, figure out better way to handle passed permissions via serviceToken payload
  if ((context.serviceToken && isEmpty(context.userInfo?.permissions)) || isEmpty(permissions)) {
    return true;
  }

  const authorizedField = getMetadataStorage().authorizedFields.find(
    (f) => f.roles === permissions,
  );

  if (authorizedField) {
    paramsTarget = (authorizedField as any).paramsTarget; // eslint-disable-line @typescript-eslint/no-explicit-any
    const permissionParams = compilePermissions(context.userInfo, permissions);

    if (paramsTarget && !isEmpty(permissionParams)) {
      args[paramsTarget] = merge(args[paramsTarget] || {}, permissionParams);
    }

    return checkPermissions(context.userInfo, permissions);
  }

  return !!compilePermissions(context.userInfo, permissions);
};

export default authChecker;
