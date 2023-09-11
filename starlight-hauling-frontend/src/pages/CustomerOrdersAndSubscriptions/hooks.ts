import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { isCore } from '@root/consts/env';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext } from '@root/hooks';

import { ICustomerOrdersAndSubscriptionLayoutNavigation } from './types';

const I18N_PATH =
  'components.PageLayouts.CustomerOrdersAndSubscriptionLayout.components.SideBarItem.Text.';

export const useNavigation = (
  counts: Record<string, number>,
): ICustomerOrdersAndSubscriptionLayoutNavigation[] => {
  const { businessUnitId } = useBusinessContext();
  const { customerId } = useParams<{ customerId: string; subPath: string }>();
  const { t } = useTranslation();

  return isCore
    ? [
        {
          title: t(`${I18N_PATH}RecurrentOrders`),
          subtitle: t(`${I18N_PATH}RecurrentOrdersCount`, { count: counts.recurrent }),
          path: pathToUrl(Paths.CustomerRecurrentOrderModule.Orders, {
            businessUnit: businessUnitId,
            customerId,
          }),
        },
      ]
    : [
        {
          title: t(`${I18N_PATH}Subscriptions`),
          subtitle: t(`${I18N_PATH}SubscriptionsCount`, { count: counts.subscription }),
          path: pathToUrl(Paths.CustomerSubscriptionModule.Subscriptions, {
            businessUnit: businessUnitId,
            customerId,
            tab: SubscriptionTabRoutes.Active,
          }),
        },
        {
          title: t(`${I18N_PATH}RecurrentOrders`),
          subtitle: t(`${I18N_PATH}RecurrentOrdersCount`, { count: counts.recurrent }),
          path: pathToUrl(Paths.CustomerRecurrentOrderModule.Orders, {
            businessUnit: businessUnitId,
            customerId,
          }),
        },
      ];
};
