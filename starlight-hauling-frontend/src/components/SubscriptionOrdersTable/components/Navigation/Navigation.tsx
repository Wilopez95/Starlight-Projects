import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RoutingNavigationItem } from '@starlightpro/shared-components';
import { camelCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { TableTools } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores, useSubscriptionOrderAvailableStatuses } from '@root/hooks';

import { INavigation } from '../types';

const I18N_PATH = 'components.SubscriptionOrdersTable.components.Navigation.Text.';

export const Navigation: React.FC<INavigation> = observer(({ children, onSearch }) => {
  const { subscriptionOrderStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const subscriptionOrderAvailableStatuses = useSubscriptionOrderAvailableStatuses();

  const routes: RoutingNavigationItem[] = useMemo(() => {
    return subscriptionOrderAvailableStatuses.map(status => ({
      content: `${t(`Text.${status}`)} ・ ${subscriptionOrderStore.getCountByStatus(status)}`,
      to: pathToUrl(Paths.SubscriptionModule.SubscriptionOrders, {
        businessUnit: businessUnitId,
        tab: camelCase(status),
      }),
    }));
  }, [businessUnitId, subscriptionOrderStore, t, subscriptionOrderAvailableStatuses]);

  return (
    <TableTools.HeaderNavigation
      routes={routes}
      placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
      filterable
      onSearch={onSearch}
    >
      {children}
    </TableTools.HeaderNavigation>
  );
});
