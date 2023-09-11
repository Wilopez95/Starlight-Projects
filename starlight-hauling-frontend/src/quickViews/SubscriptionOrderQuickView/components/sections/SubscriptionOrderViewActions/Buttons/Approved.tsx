import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import RevertOrderStatusModal from '@root/components/modals/RevertOrderStatus/RevertOrderStatus';
import { CustomerSubscriptionParams } from '@root/components/PageLayouts/CustomerSubscriptionLayout/types';
import { useBoolean, useBusinessContext, useStores } from '@root/hooks';

import { IButtons } from './types';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.SubscriptionOrderViewActions.Buttons.Approved.';

const Approved: React.FC<IButtons> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { customerId } = useParams<CustomerSubscriptionParams>();

  const [isUnapproveOrderModalOpen, openUnapproveOrderModal, closeUnapproveOrderModal] =
    useBoolean();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity;

  const handleUnapproveOrderFormSubmit = useCallback(
    async data => {
      if (subscriptionOrder) {
        await subscriptionOrderStore.unapprove({
          data,
          businessUnitId,
          id: subscriptionOrder.id,
          refreshCount: !customerId,
          sequenceId: subscriptionOrder.sequenceId,
        });
        subscriptionOrderStore.toggleQuickView(false);
      }

      closeUnapproveOrderModal();
    },
    [
      closeUnapproveOrderModal,
      subscriptionOrderStore,
      subscriptionOrder,
      businessUnitId,
      customerId,
    ],
  );

  const handleFinalize = useCallback(() => {
    onSubmit(subscriptionOrderId => {
      return subscriptionOrderStore.openCompletionDetails(subscriptionOrderId, false);
    });
  }, [onSubmit, subscriptionOrderStore]);

  return (
    <>
      <RevertOrderStatusModal
        isOpen={isUnapproveOrderModalOpen}
        onFormSubmit={handleUnapproveOrderFormSubmit}
        onClose={closeUnapproveOrderModal}
        status="approved"
      />
      <Protected permissions="orders:unapprove:perform">
        <Button variant="converseAlert" onClick={openUnapproveOrderModal}>
          {t(`Text.Unapprove`)}
        </Button>
      </Protected>
      <Protected permissions="orders:finalize:perform">
        <Layouts.Margin left="3">
          <Button variant="primary" onClick={handleFinalize}>
            {t(`${I18N_PATH}FinalizeOrder`)}
          </Button>
        </Layouts.Margin>
      </Protected>
    </>
  );
};

export default observer(Approved);
