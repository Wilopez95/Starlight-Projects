import { NavigationConfigItem } from '@starlightpro/shared-components';
import { range } from 'lodash-es';

export const materialsLoadingNavigationConfig: NavigationConfigItem[] = range(-1, -10).map(
  item => ({
    loading: true,
    key: item.toString(),
    index: item,
    width: '90%',
  }),
);
