import React from 'react';
import { useParams } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { SubscriptionTabRoutes } from '@root/consts';
import { useStores, useSubscriptionSelectedTab } from '@root/hooks';

import { CustomerSubscriptionParams } from '../../types';

import { ISubscriptionHeader } from './types';

const SubscriptionHeader: React.FC<ISubscriptionHeader> = ({ children }) => {
  const { subscriptionId } = useParams<CustomerSubscriptionParams>();
  const { subscriptionStore, subscriptionDraftStore } = useStores();

  const selectedTab = useSubscriptionSelectedTab();

  const subscription =
    selectedTab === SubscriptionTabRoutes.Draft
      ? subscriptionDraftStore.selectedEntity
      : subscriptionStore.selectedEntity;

  return (
    <Layouts.Margin top="2" bottom="2">
      <Layouts.Flex justifyContent="space-between" as={Layouts.Margin}>
        <Layouts.Box>
          <Typography variant="headerThree">Subscription #{subscriptionId}</Typography>
          <Badge borderRadius={2} color={subscription?.colorByStatus}>
            {startCase(selectedTab)}
          </Badge>
        </Layouts.Box>
        {children ? <Layouts.Flex justifyContent="flex-end">{children}</Layouts.Flex> : null}
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(SubscriptionHeader);
