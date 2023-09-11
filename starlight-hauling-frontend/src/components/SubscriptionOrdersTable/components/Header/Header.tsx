import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { SubscriptionOrderTabRoutes } from '@root/consts';
import { useStores } from '@root/hooks';
import { SubscriptionOrderStatusEnum } from '@root/types';

const I18N_PATH = 'components.SubscriptionOrdersTable.components.Header.Text.';

interface ISubscriptionOrdersPageHeader {
  tab: SubscriptionOrderTabRoutes;
  onChangeStatus(): void;
}

const Header: React.FC<ISubscriptionOrdersPageHeader> = ({ tab, onChangeStatus }) => {
  const { t } = useTranslation();
  const [totalStatus, setTotalStatus] = useState(0);
  const { subscriptionOrderStore, businessUnitStore } = useStores();
  const checkedOrdersCount = subscriptionOrderStore.checkedSubscriptionOrders.length;
  const hasBulkActions = [
    SubscriptionOrderStatusEnum.completed,
    SubscriptionOrderStatusEnum.approved,
  ];

  useEffect(() => {
    const businessUnit = businessUnitStore.selectedEntity;
    subscriptionOrderStore.requestCount(`${businessUnit?.id}`);
    const total = subscriptionOrderStore.getCountByStatus(
      subscriptionOrderStore?.values?.[0]?.status,
    );
    setTotalStatus(total);
  }, [subscriptionOrderStore, subscriptionOrderStore?.values, businessUnitStore]);

  const text = useMemo(() => {
    const status = SubscriptionOrderStatusEnum[tab];

    switch (status) {
      case SubscriptionOrderStatusEnum.completed:
        return checkedOrdersCount > 0
          ? t(`${I18N_PATH}ApproveSelected`)
          : t(`${I18N_PATH}ApproveAllSubscriptionOrders`);
      case SubscriptionOrderStatusEnum.approved:
        return checkedOrdersCount > 0
          ? t(`${I18N_PATH}FinalizeSelected`)
          : t(`${I18N_PATH}FinalizeAllSubscriptionOrders`);
      default:
        return '';
    }
  }, [checkedOrdersCount, tab, t]);

  const header =
    checkedOrdersCount === 0 ? (
      <Layouts.Flex alignItems="center">
        <Layouts.Margin right="2">
          <Typography as="h1" variant="headerTwo">
            {t(`${I18N_PATH}SubscriptionOrders`)}
          </Typography>
        </Layouts.Margin>
        <Typography color="secondary">
          {subscriptionOrderStore.values.length} of {totalStatus ?? 0}
        </Typography>
      </Layouts.Flex>
    ) : (
      <Typography as="h1" variant="headerTwo">
        {t(`${I18N_PATH}SubscriptionOrdersSelected`, { checkedOrdersCount })}
      </Typography>
    );

  return (
    <Layouts.Margin bottom="2">
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Flex alignItems="center">
          <Layouts.Margin right="2">{header}</Layouts.Margin>
        </Layouts.Flex>
        <Layouts.Flex>
          {hasBulkActions.includes(SubscriptionOrderStatusEnum[tab]) ? (
            <Button variant="primary" onClick={onChangeStatus}>
              {text}
            </Button>
          ) : null}
        </Layouts.Flex>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(Header);
