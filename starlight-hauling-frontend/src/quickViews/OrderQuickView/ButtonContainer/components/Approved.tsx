import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { RevertOrderStatusModal } from '@root/components/modals';
import { useBoolean, useStores } from '@root/hooks';

import styles from '../css/styles.scss';
import { IButtonContainer } from './types';

const I18N_PATH = 'quickViews.OrderQuickView.Actions.';

const ApprovedButtonContainer: React.FC<IButtonContainer> = ({ order }) => {
  const { orderStore } = useStores();
  const { t } = useTranslation();

  const [isUnapproveOrderModalOpen, openUnapproveOrderModal, closeUnapproveOrderModal] =
    useBoolean();

  const handleUnapproveOrderFormSubmit = useCallback(
    async data => {
      await orderStore.unapprove({ order, data, shouldDeleteFromStore: true });
      orderStore.toggleQuickView(false);
      closeUnapproveOrderModal();
    },
    [closeUnapproveOrderModal, order, orderStore],
  );

  return (
    <>
      <RevertOrderStatusModal
        isOpen={isUnapproveOrderModalOpen}
        onFormSubmit={handleUnapproveOrderFormSubmit}
        onClose={closeUnapproveOrderModal}
        status="approved"
      />
      <Protected permissions="orders:finalize:perform">
        <Button variant="primary" full onClick={order.openDetails} disabled={orderStore.editOpen}>
          {t(`${I18N_PATH}Finalize`)}
        </Button>
      </Protected>
      <Divider both />
      <div className={styles.controls}>
        <Protected permissions="orders:unapprove:perform">
          <Button variant="converseAlert" onClick={openUnapproveOrderModal}>
            {t(`${I18N_PATH}Unapprove`)}
          </Button>
        </Protected>
        <Protected permissions="orders:edit:perform">
          <Button onClick={order.openEdit} disabled={orderStore.detailsOpen}>
            {t(`${I18N_PATH}Edit`)}
          </Button>
        </Protected>
      </div>
    </>
  );
};

export default observer(ApprovedButtonContainer);
