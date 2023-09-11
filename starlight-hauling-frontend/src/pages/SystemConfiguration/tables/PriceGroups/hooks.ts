import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { PriceGroupsTab } from './types';

const I18N_PATH = 'pages.PriceGroups.Text.';

export const useNavigation = (isRecyclingLoB: boolean): NavigationConfigItem<PriceGroupsTab>[] => {
  const { t } = useTranslation();

  return useMemo(() => {
    const navItems = [
      {
        index: 0,
        label: t(`${I18N_PATH}CustomerGroup`),
        key: PriceGroupsTab.customerGroups,
      },

      {
        index: 2,
        label: t(`${I18N_PATH}Customer`),
        key: PriceGroupsTab.customers,
      },
      {
        index: 3,
        label: t(`${I18N_PATH}CustomerJobSite`),
        key: PriceGroupsTab.customerJobSites,
      },
    ];

    if (!isRecyclingLoB) {
      navItems.push({
        index: 1,
        label: t(`${I18N_PATH}ServiceArea`),
        key: PriceGroupsTab.serviceAreas,
      });
    }

    return navItems;
  }, [isRecyclingLoB, t]);
};
