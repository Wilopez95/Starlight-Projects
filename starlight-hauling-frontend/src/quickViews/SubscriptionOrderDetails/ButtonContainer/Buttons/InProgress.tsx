import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { CancelOrderTypesEnum, ICancelOrderData } from '@root/components/forms/CancelOrder/types';
import CancelOrderModal from '@root/components/modals/CancelOrder/CancelOrder';
import { CustomerSubscriptionParams } from '@root/components/PageLayouts/CustomerSubscriptionLayout/types';
import { useBoolean, useBusinessContext, useStores } from '@root/hooks';

import { IButtons } from './types';

const I18N_PATH = 'quickViews.SubscriptionOrderDetails.ButtonContainer.Buttons.InProgress.Text.';

const InProgress: React.FC<IButtons> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const { subscriptionOrderStore } = useStores();
  const [isCancelOrderModalOpen, openCancelOrderModal, closeCancelOrderModal] = useBoolean();
  const { businessUnitId } = useBusinessContext();
  const { customerId } = useParams<CustomerSubscriptionParams>();

  const handleCancelOrderFormSubmit = useCallback(
    async (data: ICancelOrderData) => {
      const subscriptionOrder = subscriptionOrderStore.selectedEntity;

      if (subscriptionOrder) {
        await subscriptionOrderStore.cancel(
          {
            id: subscriptionOrder.id,
            businessUnitId,
            refreshCount: !customerId,
          },
          data,
          subscriptionOrder.sequenceId,
        );
        closeCancelOrderModal();

        subscriptionOrderStore.closeDetails();
      }
    },
    [businessUnitId, closeCancelOrderModal, customerId, subscriptionOrderStore],
  );

  const handleComplete = useCallback(() => {
    onSubmit(data => {
      return subscriptionOrderStore.complete(data);
    });
  }, [onSubmit, subscriptionOrderStore]);

  return (
    <>
      <CancelOrderModal
        isOpen={isCancelOrderModalOpen}
        onFormSubmit={handleCancelOrderFormSubmit}
        onClose={closeCancelOrderModal}
        orderType={CancelOrderTypesEnum.SubscriptionOrder}
      />
      <Protected permissions="orders:cancel:perform">
        <Button onClick={openCancelOrderModal} variant="converseAlert">
          {t(`${I18N_PATH}CancelOrder`)}
        </Button>
      </Protected>
      <Protected permissions="orders:complete:perform">
        <Layouts.Margin left="3">
          <Button variant="primary" onClick={handleComplete}>
            {t(`${I18N_PATH}CompleteOrder`)}
          </Button>
        </Layouts.Margin>
      </Protected>
    </>
  );
};

export default observer(InProgress);
