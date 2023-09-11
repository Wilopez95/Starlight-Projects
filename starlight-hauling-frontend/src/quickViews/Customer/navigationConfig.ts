import { NavigationConfigItem } from '@starlightpro/shared-components';

export type CustomerQuickViewNavigation = 'jobSites' | 'projects';
export const customerQuickViewNavigationConfigs: NavigationConfigItem<CustomerQuickViewNavigation>[] =
  [
    {
      index: 0,
      key: 'jobSites',
      label: 'Job Sites',
    },
    {
      index: 1,
      key: 'projects',
      label: 'Projects',
    },
  ];
