import { NavigationConfigItem } from '@starlightpro/shared-components';

export type CustomerJobSiteNavigationConfigItem = 'information' | 'details' | 'taxExemptions';
export const navigationConfig: NavigationConfigItem<CustomerJobSiteNavigationConfigItem>[] = [
  {
    index: 0,
    label: 'Job Site Information',
    key: 'information',
  },
  {
    index: 1,
    label: 'Customer Job Site Details',
    key: 'details',
  },
  {
    index: 2,
    label: 'Tax Districts',
    key: 'taxExemptions',
  },
];
