import React, { FC } from 'react';
import { Trans, useTranslation } from '../../../../i18n';
import { useLocation } from 'react-router-dom';
import { Button } from '@material-ui/core';

import { useDeleteOrderMutation } from '../../../../graphql/api';
import { closeSidePanel } from '../../../../components/SidePanels';
import { closeModal, openModal } from '../../../../components/Modals';
import { showError, showSuccess } from '../../../../components/Toast';
import { refreshYardOperationConsole } from '../../refreshYardOperationConsole';
import ConfirmDeleteModal from '../../../../components/Modal/ConfirmDeleteModal';

interface Props {
  orderId: number;
}

export const DeleteButton: FC<Props> = ({ orderId }) => {
  const [deleteOrder] = useDeleteOrderMutation();
  const [t] = useTranslation();
  const location = useLocation();

  const handleOrderDelete = () => {
    openModal({
      content: (
        <ConfirmDeleteModal
          title={<Trans>Delete Order</Trans>}
          description={
            <Trans values={{ orderId }}>
              Please confirm #<b>{{ orderId }}</b> order deletion.
            </Trans>
          }
          deleteLabel={<Trans>Confirm</Trans>}
          onCancel={closeModal}
          onDelete={async () => {
            try {
              await deleteOrder({ variables: { id: orderId } });
              closeModal();
              closeSidePanel();
              showSuccess(t('Order has been deleted!'));

              if (location.pathname.indexOf('console') !== -1) {
                refreshYardOperationConsole();
              }
            } catch (e) {
              showError(t('Could not delete order!'));
            }
          }}
        />
      ),
    });
  };

  return (
    <Button onClick={handleOrderDelete} variant="outlined" color="secondary">
      <Trans>Delete</Trans>
    </Button>
  );
};
