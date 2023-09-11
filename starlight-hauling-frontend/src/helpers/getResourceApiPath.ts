import { Routes } from '@root/consts';

export const getResourceApiPath = (tenantName?: string, businessUnit?: string) => {
  const currentPathname = location.pathname;

  if (businessUnit && tenantName && currentPathname.includes(`/${Routes.BusinessUnits}/`)) {
    return `${tenantName}/${Routes.BusinessUnits}/${businessUnit}`;
  }

  if (tenantName && currentPathname.includes(`/${Routes.Configuration}`)) {
    return `${tenantName}/${Routes.Configuration}`;
  }

  return `${Routes.Lobby}`;
};
