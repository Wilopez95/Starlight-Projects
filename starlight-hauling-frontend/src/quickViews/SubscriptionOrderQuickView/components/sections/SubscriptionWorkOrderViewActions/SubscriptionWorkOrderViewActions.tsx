import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { SubscriptionOrderStatusEnum } from '@root/types';

const SubscriptionWorkOrderViewActions: React.FC = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;
  const isFinalized = subscriptionOrder?.status === SubscriptionOrderStatusEnum.finalized;

  const handleOnClick = useCallback(() => {
    if (subscriptionWorkOrder) {
      subscriptionWorkOrderStore.requestById(subscriptionWorkOrder.id);
      subscriptionWorkOrderStore.openWorkOrderEdit();
    }
  }, [subscriptionWorkOrder, subscriptionWorkOrderStore]);

  return (
    <Layouts.Padding padding="2">
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Flex>
          {!isFinalized ? <Button onClick={handleOnClick}>{t(`Text.Edit`)}</Button> : null}
        </Layouts.Flex>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};

export default observer(SubscriptionWorkOrderViewActions);
