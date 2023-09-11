import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';

import { Protected } from '@root/common';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import styles from '../css/styles.scss';
import { IButtonContainer } from './types';

const I18N_PATH = 'quickViews.OrderQuickView.Actions.';

const CompletedButtonContainer: React.FC<IButtonContainer> = ({ order }) => {
  const { orderStore } = useStores();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();

  return (
    <div className={styles.controls}>
      <Protected permissions="orders:edit:perform">
        <Button onClick={order.openEdit} disabled={orderStore.editOpen}>
          {t(`${I18N_PATH}Edit`)}
        </Button>
      </Protected>
      {order.landfillOperationId ? (
        <Button
          variant="conversePrimary"
          to={pathToUrl(Paths.LandfillOperationsModule.LandfillOperations, {
            businessUnit: businessUnitId,
            id: order.landfillOperationId,
          })}
        >
          {t(`Text.LandfillDetails`)}
        </Button>
      ) : null}
      <Protected permissions="orders:approve:perform">
        <Button variant="primary" onClick={order.openDetails} disabled={orderStore.detailsOpen}>
          {t(`${I18N_PATH}Approve`)}
        </Button>
      </Protected>
    </div>
  );
};

export default CompletedButtonContainer;
