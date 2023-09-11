import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ICustomerBalances } from '@root/stores/customer/type';
import { Customer } from '@root/stores/entities';

const I18N_PATH = 'components.PageLayouts.CustomerLayout.CustomerInformation.Text.';

export interface IBalanceItemConfig {
  label: string;
  key: keyof ICustomerBalances;
  value: number;
  loading: boolean;
  highlightNegativeValue?: boolean;
  hasNavigation?: boolean;
}

export const useCustomerBalancesConfig = (customer: Customer | null): IBalanceItemConfig[] => {
  const { t } = useTranslation();

  const balances = customer?.balances;

  useEffect(() => {
    if (customer && !balances) {
      customer.requestBalances();
    }
  }, [balances, customer]);

  return [
    {
      label: t(`${I18N_PATH}CreditLimit`),
      key: 'creditLimit',
      value: balances?.creditLimit ?? 0,
      loading: !balances,
    },
    {
      label: t(`${I18N_PATH}Balance`),
      key: 'balance',
      value: balances?.balance ?? 0,
      loading: !balances,
      highlightNegativeValue: (balances?.availableCredit ?? 0) < 0,
      hasNavigation: true,
    },
    {
      label: t(`${I18N_PATH}AvailableCredit`),
      key: 'availableCredit',
      highlightNegativeValue: (balances?.availableCredit ?? 0) < 0,
      value: balances?.availableCredit ?? 0,
      loading: !balances,
    },
  ];
};
