import React from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Table, TableBody, TableTools } from '@root/common/TableTools';
import { useIntl } from '@root/i18n/useIntl';
import { useStores } from '@hooks';

import { IInvoiceSubscriptionModel, InvoiceType } from '../../../types';

import SubscriptionExpandableRow from './SubscriptionExpandableRow/SubscriptionExpandableRow';

const I18NPath = 'pages.Invoices.components.InvoiceQuickView.tabs.Subscriptions.';

const Subscriptions: React.FC = () => {
  const { t } = useTranslation();
  const { currencySymbol } = useIntl();

  const { invoiceStore } = useStores();
  const loading = invoiceStore.quickViewLoading;

  const currentInvoice = invoiceStore.selectedEntity!;
  const subscriptions = currentInvoice.invoicedEntityList as IInvoiceSubscriptionModel[] | null;

  if (currentInvoice.type !== InvoiceType.subscriptions) {
    return null;
  }

  return (
    <Table>
      <TableTools.Header>
        <TableTools.HeaderCell width="250px">{t(`${I18NPath}BillingPeriod`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell colSpan={3}>{t(`${I18NPath}Service`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell right>
          {t(`${I18NPath}Amount`, { currency: currencySymbol })}
        </TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody loading={loading} cells={5} noResult={subscriptions?.length === 0}>
        {subscriptions?.map((subscription, index) => (
          <SubscriptionExpandableRow
            key={`subscription_${index}`}
            subscription={subscription}
            customer={currentInvoice.customer}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(Subscriptions);
