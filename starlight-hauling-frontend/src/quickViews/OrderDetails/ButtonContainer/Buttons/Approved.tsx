import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, useQuickViewContext } from '@root/common';
import { RevertOrderStatusModal } from '@root/components/modals';
import { useBoolean, useStores } from '@root/hooks';

import { IButtons } from './types';

const Approve: React.FC<IButtons> = ({ onSubmit, shouldRemoveOrderFromStore }) => {
  const { forceCloseQuickView } = useQuickViewContext();
  const { orderStore } = useStores();
  const [isUnapproveOrderModalOpen, openUnapproveOrderModal, closeUnapproveOrderModal] =
    useBoolean();

  const order = orderStore.selectedEntity!;

  const handleUnapproveOrderFormSubmit = useCallback(
    async data => {
      await orderStore.unapprove({
        order,
        data,
        shouldDeleteFromStore: shouldRemoveOrderFromStore,
      });

      forceCloseQuickView();
      closeUnapproveOrderModal();
    },
    [closeUnapproveOrderModal, forceCloseQuickView, order, orderStore, shouldRemoveOrderFromStore],
  );

  const handleFinalize = useCallback(() => {
    onSubmit(values => {
      return orderStore.finalize({
        order: values,
        shouldDeleteFromStore: shouldRemoveOrderFromStore,
      });
    });
  }, [onSubmit, orderStore, shouldRemoveOrderFromStore]);

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
          Unapprove
        </Button>
      </Protected>
      <Protected permissions="orders:finalize:perform">
        <Layouts.Margin left="3">
          <Button variant="primary" onClick={handleFinalize}>
            Finalize Order
          </Button>
        </Layouts.Margin>
      </Protected>
    </>
  );
};

export default observer(Approve);
