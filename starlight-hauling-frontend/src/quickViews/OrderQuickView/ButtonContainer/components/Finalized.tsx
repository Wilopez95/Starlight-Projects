import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import { RevertOrderStatusModal } from '@root/components/modals';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBoolean, useStores } from '@root/hooks';
import { Order } from '@root/stores/entities';

import styles from '../css/styles.scss';
import { IButtonContainer } from './types';

const buildOrderDetailsPath = (order: Order) =>
  pathToUrl(Paths.CustomerJobSiteModule.OpenOrders, {
    businessUnit: order.businessUnit.id,
    customerId: order.customer.originalId,
    jobSiteId: order.jobSite.originalId,
    id: order.id,
  });

const I18N_PATH = 'quickViews.OrderQuickView.Actions.';

const FinalizedButtonContainer: React.FC<IButtonContainer> = ({ order }) => {
  const { orderStore } = useStores();
  const { t } = useTranslation();

  const [isUnfinalizeOrderModalOpen, openUnfinalizeOrderModal, closeUnfinalizeOrderModal] =
    useBoolean();

  const handleUnfinalizeOrderFormSubmit = useCallback(
    async data => {
      await orderStore.unfinalize({ order, data, shouldDeleteFromStore: true });
      orderStore.toggleQuickView(false);
      closeUnfinalizeOrderModal();
    },
    [closeUnfinalizeOrderModal, order, orderStore],
  );

  return (
    <>
      <RevertOrderStatusModal
        isOpen={isUnfinalizeOrderModalOpen}
        onFormSubmit={handleUnfinalizeOrderFormSubmit}
        onClose={closeUnfinalizeOrderModal}
        status="finalized"
      />

      <div className={styles.controls}>
        <Protected permissions="orders:unfinalize:perform">
          <Button variant="converseAlert" onClick={openUnfinalizeOrderModal}>
            {t(`${I18N_PATH}Unfinalize`)}
          </Button>
        </Protected>
        <Button to={buildOrderDetailsPath(order)}>{t(`${I18N_PATH}Details`)}</Button>
      </div>
    </>
  );
};

export default observer(FinalizedButtonContainer);
