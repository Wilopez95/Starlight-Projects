import { NavigationConfigItem } from '@starlightpro/shared-components';

export type JobSiteNavigationConfigItem = 'jobSite' | 'taxDistricts';
export const navigationConfig: NavigationConfigItem<JobSiteNavigationConfigItem>[] = [
  {
    index: 0,
    label: 'Job Site',
    key: 'jobSite',
  },
  {
    index: 1,
    label: 'Tax Districts',
    key: 'taxDistricts',
  },
];
