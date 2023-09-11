import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, useQuickViewContext } from '@root/common';
import { CancelOrderModal, ConfirmModal } from '@root/components/modals';
import { useBoolean, useStores, useToggle } from '@root/hooks';

import { IButtons } from './types';

const InProgress: React.FC<IButtons> = ({ onSubmit, shouldRemoveOrderFromStore }) => {
  const { t } = useTranslation();
  const { orderStore } = useStores();
  const [isCancelOrderModalOpen, openCancelOrderModal, closeCancelOrderModal] = useBoolean();
  const [isRatesNotFoundModalOpen, toggleRatesNotFoundModal] = useToggle();
  const { forceCloseQuickView } = useQuickViewContext();

  const handleCancelOrderFormSubmit = useCallback(
    async data => {
      if (!orderStore.selectedEntity) {
        return;
      }

      await orderStore.cancel({
        data,
        order: orderStore.selectedEntity,
        shouldDeleteFromStore: shouldRemoveOrderFromStore,
      });
      closeCancelOrderModal();

      if (orderStore.ratesError) {
        toggleRatesNotFoundModal();
        orderStore.cleanRatesError();
      } else {
        forceCloseQuickView();
      }
    },
    [
      closeCancelOrderModal,
      forceCloseQuickView,
      orderStore,
      shouldRemoveOrderFromStore,
      toggleRatesNotFoundModal,
    ],
  );

  const handleRatesNotFoundModalClose = useCallback(() => {
    toggleRatesNotFoundModal();
    forceCloseQuickView();
  }, [forceCloseQuickView, toggleRatesNotFoundModal]);

  const handleComplete = useCallback(() => {
    onSubmit(values => {
      return orderStore.completeOrder({
        completedOrder: values,
        shouldDeleteFromStore: shouldRemoveOrderFromStore,
      });
    });
  }, [onSubmit, orderStore, shouldRemoveOrderFromStore]);

  return (
    <>
      <CancelOrderModal
        isOpen={isCancelOrderModalOpen}
        onFormSubmit={handleCancelOrderFormSubmit}
        onClose={closeCancelOrderModal}
      />
      <ConfirmModal
        isOpen={isRatesNotFoundModalOpen}
        title={t('components.modals.CancelOrderRatesNotFound.Text.Title')}
        cancelButton={t('Text.Close')}
        subTitle={t('components.modals.CancelOrderRatesNotFound.Text.SubTitle')}
        onCancel={handleRatesNotFoundModalClose}
      />
      <Protected permissions="orders:cancel:perform">
        <Button onClick={openCancelOrderModal} variant="converseAlert">
          Cancel Order
        </Button>
      </Protected>
      <Protected permissions="orders:complete:perform">
        <Layouts.Margin left="3">
          <Button variant="primary" onClick={handleComplete} disabled={orderStore.detailsLoading}>
            Complete Order
          </Button>
        </Layouts.Margin>
      </Protected>
    </>
  );
};

export default observer(InProgress);
