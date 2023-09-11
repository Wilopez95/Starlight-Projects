import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { Order } from '@root/stores/entities';

import styles from '../css/styles.scss';
import { IButtonContainer } from './types';

const I18N_PATH = 'quickViews.OrderQuickView.Actions.';

const buildOrderDetailsPath = (order: Order) =>
  pathToUrl(Paths.CustomerJobSiteModule.InvoicedOrders, {
    businessUnit: order.businessUnit.id,
    jobSiteId: order.jobSite.originalId,
    id: order.id,
    customerId: order.customer.originalId,
  });
const buildInvoiceDetailsPath = (order: Order) =>
  `${pathToUrl(Paths.BillingModule.Invoices, {
    subPath: Routes.Invoices,
    businessUnit: order.businessUnit.id,
  })}?orderId=${order.id}`;

const InvoicedButtonContainer: React.FC<IButtonContainer> = ({ order }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.controls}>
      <Button variant="converseAlert" to={buildInvoiceDetailsPath(order)}>
        {t(`${I18N_PATH}Invoice`)}
      </Button>
      <Button to={buildOrderDetailsPath(order)}>{t(`${I18N_PATH}Details`)}</Button>
    </div>
  );
};

export default observer(InvoicedButtonContainer);
