import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Tooltip } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { CancelOrderModal, ConfirmModal } from '@root/components/modals';
import { Paths } from '@root/consts';
import { formatCreditCard, pathToUrl } from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  useOpenEditOrderHandler,
  useStores,
  useToggle,
} from '@root/hooks';
import { ChargePaymentModal } from '@root/modules/billing/components';

import styles from '../css/styles.scss';
import { IButtonContainer } from './types';

const I18N_PATH = 'quickViews.OrderQuickView.Actions.';

const InProgressButtonContainer: React.FC<IButtonContainer> = ({ order }) => {
  const { orderStore, paymentStore } = useStores();
  const selectedPayment = paymentStore.selectedEntity;
  const selectedPaymentId = selectedPayment?.id;
  const selectedOrder = orderStore.selectedEntity;
  const { businessUnitId } = useBusinessContext();
  const { handleOpenEditOrderInProgress } = useOpenEditOrderHandler({
    serviceDate: order.serviceDate,
    openEdit: order.openEdit,
  });

  const history = useHistory();
  const { t } = useTranslation();

  let creditCardLabel = '';

  if (selectedPayment?.creditCard) {
    creditCardLabel = formatCreditCard(selectedPayment.creditCard);
  }

  const [isCancelOrderModalOpen, openCancelOrderModal, closeCancelOrderModal] = useBoolean();
  const [isChargePaymentModalOpen, openChargePaymentModal, closeChargePaymentModal] = useBoolean();
  const [isChargeConfirmModalOpen, openChargeConfirmModal, closeChargeConfirmModal] = useBoolean();
  const [isRatesNotFoundModalOpen, toggleRatesNotFoundModal] = useToggle();

  const handleCancelOrderFormSubmit = useCallback(
    async data => {
      await orderStore.cancel({ order, data, shouldDeleteFromStore: true });

      closeCancelOrderModal();

      if (orderStore.ratesError) {
        toggleRatesNotFoundModal();
        orderStore.cleanRatesError();
      } else {
        orderStore.toggleQuickView(false);
      }
    },
    [closeCancelOrderModal, order, orderStore, toggleRatesNotFoundModal],
  );

  const handleRatesNotFoundModalClose = useCallback(() => {
    toggleRatesNotFoundModal();
    orderStore.toggleQuickView(false);
  }, [orderStore, toggleRatesNotFoundModal]);

  const handleChargePayment = useCallback(async () => {
    if (selectedPaymentId) {
      const url = pathToUrl(Paths.BillingModule.DeferredPayments, {
        businessUnit: businessUnitId,
        paymentId: undefined,
        id: undefined,
      });

      history.push(url);

      await paymentStore.chargeDeferredPayment(selectedPaymentId, +businessUnitId);
      closeChargeConfirmModal();
      orderStore.unSelectEntity();
    }
  }, [
    paymentStore,
    selectedPaymentId,
    businessUnitId,
    orderStore,
    history,
    closeChargeConfirmModal,
  ]);

  const isMultipleOrdersCharge = useMemo(() => {
    return selectedPayment?.orders && selectedPayment.orders.length > 1;
  }, [selectedPayment]);

  const completeButton = (
    <Protected permissions="orders:complete:perform">
      <Button
        variant="primary"
        full
        onClick={order.openDetails}
        disabled={order.deferred || orderStore.editOpen}
      >
        {t(`${I18N_PATH}Complete`)}
      </Button>
    </Protected>
  );

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
      {selectedOrder ? (
        <ChargePaymentModal
          isOpen={isChargePaymentModalOpen}
          onClose={closeChargePaymentModal}
          onSubmit={handleChargePayment}
          paymentMethod={selectedOrder?.paymentMethod}
          creditCardLabel={creditCardLabel}
          paymentAmount={selectedPayment?.amount}
        />
      ) : null}
      <ConfirmModal
        isOpen={isChargeConfirmModalOpen}
        cancelButton="Cancel"
        submitButton="Save Changes"
        title="Multiple orders payment"
        subTitle="Changes in payment details will affect multiple orders. Are you sure?"
        onCancel={closeChargeConfirmModal}
        onSubmit={handleChargePayment}
        nonDestructive
      />

      {selectedPayment ? (
        <div className={styles.controls}>
          <Protected permissions="orders:edit:perform">
            <Button onClick={handleOpenEditOrderInProgress} disabled={orderStore.detailsOpen}>
              {t(`${I18N_PATH}Edit`)}
            </Button>
          </Protected>
          <Protected permissions="billing:charge-deferred-payments:perform">
            <Button
              onClick={isMultipleOrdersCharge ? openChargeConfirmModal : openChargePaymentModal}
              variant="primary"
              disabled={selectedPayment.status !== 'deferred'}
            >
              {t(`${I18N_PATH}Charge`)}
            </Button>
          </Protected>
        </div>
      ) : (
        <>
          {order.deferred ? (
            <Tooltip position="top" fullWidth text="Order can't be processed with deferred payment">
              {completeButton}
            </Tooltip>
          ) : (
            completeButton
          )}
          <Divider both />
          <div className={styles.controls}>
            <Protected permissions="orders:cancel:perform">
              <Button variant="converseAlert" onClick={openCancelOrderModal}>
                {t(`${I18N_PATH}Cancel`)}
              </Button>
            </Protected>
            <Protected permissions="orders:edit:perform">
              <Button onClick={handleOpenEditOrderInProgress} disabled={orderStore.detailsOpen}>
                {t(`${I18N_PATH}Edit`)}
              </Button>
            </Protected>
          </div>
        </>
      )}
    </>
  );
};

export default observer(InProgressButtonContainer);
