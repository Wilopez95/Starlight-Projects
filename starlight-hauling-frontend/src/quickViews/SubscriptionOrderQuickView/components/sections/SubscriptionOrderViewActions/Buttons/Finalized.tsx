import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import RevertOrderStatusModal from '@root/components/modals/RevertOrderStatus/RevertOrderStatus';
import { CustomerSubscriptionParams } from '@root/components/PageLayouts/CustomerSubscriptionLayout/types';
import { useBoolean, useBusinessContext, useStores } from '@root/hooks';

import { IButtons } from './types';

const Finalized: React.FC<IButtons> = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { customerId } = useParams<CustomerSubscriptionParams>();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity;

  const [isUnfinalizeOrderModalOpen, openUnfinalizeOrderModal, closeUnfinalizeOrderModal] =
    useBoolean();

  const handleUnfinalizeClick = useCallback(
    async data => {
      if (subscriptionOrder) {
        await subscriptionOrderStore.unfinalize({
          data,
          businessUnitId,
          id: subscriptionOrder.id,
          refreshCount: !customerId,
          sequenceId: subscriptionOrder.sequenceId,
        });
        subscriptionOrderStore.toggleQuickView(false);
      }
      closeUnfinalizeOrderModal();
    },
    [
      closeUnfinalizeOrderModal,
      subscriptionOrder,
      subscriptionOrderStore,
      businessUnitId,
      customerId,
    ],
  );

  return (
    <>
      <RevertOrderStatusModal
        isOpen={isUnfinalizeOrderModalOpen}
        onFormSubmit={handleUnfinalizeClick}
        onClose={closeUnfinalizeOrderModal}
        status="finalized"
      />
      <Protected permissions="orders:unfinalize:perform">
        <Button variant="primary" onClick={() => openUnfinalizeOrderModal()}>
          {t(`Text.Unfinalize`)}
        </Button>
      </Protected>
    </>
  );
};

export default observer(Finalized);
