import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';

import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
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

const CanceledButtonContainer: React.FC<IButtonContainer> = ({ order }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.controls}>
      <div />
      <Button to={buildOrderDetailsPath(order)}>{t(`${I18N_PATH}Details`)}</Button>
    </div>
  );
};

export default CanceledButtonContainer;
