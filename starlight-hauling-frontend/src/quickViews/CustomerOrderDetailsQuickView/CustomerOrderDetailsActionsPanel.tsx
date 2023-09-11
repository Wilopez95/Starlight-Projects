import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Tooltip } from '@root/common';
import { CancelOrderModal, ConfirmModal } from '@root/components/modals';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  useIsRecyclingFacilityBU,
  useOpenEditOrderHandler,
  useStores,
  useToggle,
} from '@root/hooks';

import { ICustomerOrderDetailsActionsPanel } from './types';

const I18N_PATH = 'quickViews.OrderDetailsView.Text.';

const CustomerOrderDetailsActionsPanel: React.FC<ICustomerOrderDetailsActionsPanel> = ({
  onOpenHistory,
}) => {
  const { orderStore } = useStores();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const isRecyclingBU = useIsRecyclingFacilityBU();
  const [isCancelOrderModalOpen, openCancelOrderModal, closeCancelOrderModal] = useBoolean();

  const [isRatesNotFoundModalOpen, toggleRatesNotFoundModal] = useToggle();

  const currentOrder = orderStore.selectedEntity;

  const handleCancelOrderFormSubmit = useCallback(
    async data => {
      if (!currentOrder) {
        return;
      }

      await orderStore.cancel({
        order: currentOrder,
        data,
        shouldDeleteFromStore: false,
      });

      closeCancelOrderModal();

      if (orderStore.ratesError) {
        toggleRatesNotFoundModal();
        orderStore.cleanRatesError();
      } else {
        orderStore.requestDetails({
          orderId: currentOrder.id,
          edit: true,
          shouldOpenQuickView: true,
        });
      }
    },
    [closeCancelOrderModal, currentOrder, orderStore, toggleRatesNotFoundModal],
  );

  const handleOpenDetails = useCallback(() => {
    currentOrder?.openDetails();
    orderStore.toggleQuickView(true);
  }, [currentOrder, orderStore]);

  const openEdit = useCallback(() => {
    currentOrder?.openEdit();
    orderStore.toggleQuickView(true);
  }, [currentOrder, orderStore]);

  const { handleOpenEditOrderInProgress } = useOpenEditOrderHandler({
    serviceDate: currentOrder?.serviceDate,
    openEdit,
  });

  const handleOpenEdit =
    currentOrder?.status === 'inProgress' ? handleOpenEditOrderInProgress : openEdit;

  if (!currentOrder) {
    return null;
  }

  const isEditAllowed = ['inProgress', 'completed', 'approved'].includes(currentOrder.status);
  const isCompletionDetailsAllowed = ['finalized', 'invoiced'].includes(currentOrder.status);

  const completionDetailsButton = (
    <Protected permissions="orders:complete:perform">
      <Button variant="primary" onClick={handleOpenDetails} disabled={currentOrder.deferred}>
        {t(`${I18N_PATH}CompletionDetails`)}
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
        onCancel={toggleRatesNotFoundModal}
      />
      <Layouts.Flex justifyContent="space-between">
        <Layouts.Flex>
          {currentOrder.status === 'inProgress' ? (
            <Protected permissions="orders:cancel:perform">
              <Layouts.Margin right="2">
                <Button variant="converseAlert" onClick={openCancelOrderModal}>
                  Cancel Order
                </Button>
              </Layouts.Margin>
            </Protected>
          ) : null}
        </Layouts.Flex>
        <Layouts.Flex>
          <Layouts.Margin right="2">
            <Button variant="conversePrimary" onClick={onOpenHistory}>
              {t(`${I18N_PATH}OrderHistory`)}
            </Button>
          </Layouts.Margin>
          {currentOrder.landfillOperationId ? (
            <Layouts.Margin right="2">
              <Button
                variant="conversePrimary"
                to={pathToUrl(Paths.LandfillOperationsModule.LandfillOperations, {
                  businessUnit: businessUnitId,
                  id: currentOrder.landfillOperationId,
                })}
              >
                {t(`Text.LandfillDetails`)}
              </Button>
            </Layouts.Margin>
          ) : null}

          {!isRecyclingBU && isCompletionDetailsAllowed ? (
            <Layouts.Margin right="2">
              {currentOrder.deferred ? (
                <Tooltip
                  position="top"
                  fullWidth
                  text="Order can't be processed with deferred payment"
                >
                  {completionDetailsButton}
                </Tooltip>
              ) : (
                completionDetailsButton
              )}
            </Layouts.Margin>
          ) : null}
          {isEditAllowed ? (
            <Protected permissions="orders:edit:perform">
              <Button variant="primary" onClick={handleOpenEdit}>
                Edit Order
              </Button>
            </Protected>
          ) : null}
        </Layouts.Flex>
      </Layouts.Flex>
    </>
  );
};

export default observer(CustomerOrderDetailsActionsPanel);
