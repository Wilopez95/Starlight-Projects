import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { CancelOrderTypesEnum, ICancelOrderData } from '@root/components/forms/CancelOrder/types';
import CancelOrderModal from '@root/components/modals/CancelOrder/CancelOrder';
import ConfirmModal from '@root/components/modals/Confirm/Confirm';
import { CustomerSubscriptionParams } from '@root/components/PageLayouts/CustomerSubscriptionLayout/types';
import { useBoolean, useBusinessContext, useStores, useToggle } from '@root/hooks';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.SubscriptionOrderViewActions.Buttons.InProgress.';

const CancelOrder: React.FC = () => {
  const { t } = useTranslation();
  const { subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const [isRatesNotFoundModalOpen, toggleRatesNotFoundModal] = useToggle();
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

        subscriptionWorkOrderStore.cleanup();
      }

      if (subscriptionOrderStore.ratesError) {
        toggleRatesNotFoundModal();
        subscriptionOrderStore.cleanRatesError();
      } else {
        subscriptionOrderStore.toggleQuickView(false);
      }

      closeCancelOrderModal();
    },
    [
      businessUnitId,
      closeCancelOrderModal,
      customerId,
      subscriptionOrderStore,
      subscriptionWorkOrderStore,
      toggleRatesNotFoundModal,
    ],
  );

  const handleRatesNotFoundModalClose = useCallback(() => {
    toggleRatesNotFoundModal();
    subscriptionOrderStore.toggleQuickView(false);
  }, [subscriptionOrderStore, toggleRatesNotFoundModal]);

  return (
    <Protected permissions="orders:cancel:perform">
      <CancelOrderModal
        isOpen={isCancelOrderModalOpen}
        onFormSubmit={handleCancelOrderFormSubmit}
        onClose={closeCancelOrderModal}
        orderType={CancelOrderTypesEnum.SubscriptionOrder}
      />
      <ConfirmModal
        isOpen={isRatesNotFoundModalOpen}
        title={t('components.modals.CancelOrderRatesNotFound.Text.Title')}
        cancelButton={t('Text.Close')}
        subTitle={t('components.modals.CancelOrderRatesNotFound.Text.SubTitle')}
        onCancel={handleRatesNotFoundModalClose}
      />
      <Button onClick={openCancelOrderModal} variant="converseAlert">
        {t(`${I18N_PATH}CancelOrder`)}
      </Button>
    </Protected>
  );
};

export default observer(CancelOrder);
