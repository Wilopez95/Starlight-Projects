import { CRUDPermissions } from './types/CRUDPermissions';

export const addRootPermissions = (permissions: CRUDPermissions, rootPermissions: string[]) => {
  return Object.entries(permissions).reduce(
    (result, current) => ({
      ...result,
      [current[0]]: [
        ...(Array.isArray(current[1]) ? current[1] : [current[1]]),
        ...rootPermissions,
      ],
    }),
    {},
  );
};
