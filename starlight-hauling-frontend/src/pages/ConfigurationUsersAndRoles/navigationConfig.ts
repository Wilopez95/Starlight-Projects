import { RoutingNavigationItem } from '@root/common/RoutingNavigation';
import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';

export const usersPath = pathToUrl(Paths.SystemConfigurationModule.UserAndRoles, {
  subPath: Routes.Users,
});

export const rolesPath = pathToUrl(Paths.SystemConfigurationModule.UserAndRoles, {
  subPath: Routes.Roles,
});

export const routesNavigationConfig: RoutingNavigationItem[] = [
  {
    content: 'Users',
    to: usersPath,
  },
  {
    content: 'Roles',
    to: rolesPath,
  },
];
