import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { BillableItemActionEnum } from '@root/consts/billableItem';
import { useStores } from '@root/hooks';
import { SubscriptionOrderStatusEnum } from '@root/types';

import { getButtons } from './Buttons';

const SubscriptionOrderViewActions: React.FC = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity!;

  const handleSubmit = (callback: (data: number) => Promise<void>) => {
    callback(subscriptionOrder.id);
  };

  const ButtonsComponent = getButtons(subscriptionOrder.status);

  const isNonServiceOrder =
    subscriptionOrder.billableService.action === BillableItemActionEnum.nonService;

  const editable = ![
    SubscriptionOrderStatusEnum.finalized,
    SubscriptionOrderStatusEnum.canceled,
    SubscriptionOrderStatusEnum.invoiced,
  ].includes(subscriptionOrder.status);

  const handleEdit = useCallback(() => {
    if (subscriptionOrder?.id) {
      subscriptionOrderStore.requestById(subscriptionOrder.id);
    }
    if (subscriptionOrder) {
      if (isNonServiceOrder) {
        subscriptionOrderStore.openNonServiceEdit(subscriptionOrder);
      } else {
        subscriptionOrderStore.openEdit(subscriptionOrder);
      }
    }
  }, [subscriptionOrder, subscriptionOrderStore, isNonServiceOrder]);

  return (
    <Layouts.Flex justifyContent="space-between">
      {editable ? (
        <Protected permissions="orders:edit:perform">
          <Layouts.Flex>
            <Button onClick={handleEdit}>{t(`Text.Edit`)}</Button>
          </Layouts.Flex>
        </Protected>
      ) : null}

      <Layouts.Flex>
        {ButtonsComponent ? <ButtonsComponent onSubmit={handleSubmit} /> : null}
      </Layouts.Flex>
    </Layouts.Flex>
  );
};

export default observer(SubscriptionOrderViewActions);
