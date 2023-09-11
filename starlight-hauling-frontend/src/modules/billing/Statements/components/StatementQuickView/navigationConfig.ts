import { NavigationConfigItem } from '@starlightpro/shared-components';

export const navigationConfig: NavigationConfigItem<'statement' | 'emailLog'>[] = [
  {
    index: 0,
    label: 'Statement',
    key: 'statement',
  },
  {
    index: 1,
    label: 'Email log',
    key: 'emailLog',
  },
];
