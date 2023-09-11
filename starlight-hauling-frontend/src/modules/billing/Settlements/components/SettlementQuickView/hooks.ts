import { useTranslation } from 'react-i18next';
import { type NavigationConfigItem } from '@starlightpro/shared-components';

import { SettlementTabKey } from './types';

const I18N_PATH = 'modules.billing.Settlements.components.SettlementQuickView.Text.';

export const useNavigation = (): NavigationConfigItem<SettlementTabKey>[] => {
  const { t } = useTranslation();

  return [
    {
      index: 0,
      label: t(`${I18N_PATH}Settled`),
      key: SettlementTabKey.settled,
    },
    {
      index: 0,
      label: t(`${I18N_PATH}Unconfirmed`),
      key: SettlementTabKey.unconfirmed,
    },
  ];
};
