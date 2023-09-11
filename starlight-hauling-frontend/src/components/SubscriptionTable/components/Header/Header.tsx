import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { camelCase, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { SubscriptionTabRoutes } from '@root/consts';
import { useStores, useSubscriptionSelectedTab } from '@root/hooks';
import { getSubscriptionStatusByTab } from '@root/stores/subscription/helpers';

import { ISubscriptionTableHeader } from './types';

const I18N_PATH = 'pages.Subscriptions.';

const Header: React.FC<ISubscriptionTableHeader> = ({ mine }) => {
  const { subscriptionStore, subscriptionDraftStore } = useStores();
  const { t } = useTranslation();

  const selectedTab = useSubscriptionSelectedTab();

  const isDraftTab = selectedTab === SubscriptionTabRoutes.Draft;

  const statusLabel = t(
    `${I18N_PATH}status.${startCase(camelCase(selectedTab)).replace(/ /g, '')}`,
  );

  const store = isDraftTab ? subscriptionDraftStore : subscriptionStore;
  const displayed = store.values.length;

  const total: number = useMemo(
    () =>
      selectedTab === SubscriptionTabRoutes.Draft
        ? subscriptionDraftStore.getCounts(mine)?.total ?? 0
        : subscriptionStore.getCountByStatus(getSubscriptionStatusByTab(selectedTab), mine),
    [mine, selectedTab, subscriptionDraftStore, subscriptionStore],
  );

  return (
    <Layouts.Margin bottom="2">
      <Layouts.Flex alignItems="center">
        <Layouts.Margin right="2">
          <Typography as="h1" variant="headerTwo">
            {t(`${I18N_PATH}components.Header.Title`, { status: statusLabel })}
          </Typography>
        </Layouts.Margin>
        {!store.loading ? (
          <Typography color="secondary">
            {displayed} of {total}
          </Typography>
        ) : null}
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(Header);
