import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Table, TableBody, TableHeadCell, TableHeader } from '@root/core/common/TableTools';
import { useRegionConfig, useStores } from '@root/core/hooks';
import { IInvoiceSubscriptionModel, InvoiceType } from '@root/finance/types/entities';

import SubscriptionExpandableRow from './SubscriptionExpandableRow/SubscriptionExpandableRow';

const I18N_PATH = 'modules.finance.quickviews.InvoiceDetails.Subscriptions.';

const Subscriptions: React.FC = () => {
  const { t } = useTranslation();
  const { currencySymbol } = useRegionConfig();

  const { invoiceStore } = useStores();
  const loading = invoiceStore.quickViewLoading;

  const currentInvoice = invoiceStore.selectedEntity!;
  const subscriptions = currentInvoice.invoicedEntityList as IInvoiceSubscriptionModel[] | null;

  if (currentInvoice.type !== InvoiceType.subscriptions) {
    return null;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableHeadCell width='250px'>
            <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
              {t(`${I18N_PATH}BillingPeriod`)}
            </Typography>
          </TableHeadCell>
          <TableHeadCell colSpan={3}>
            <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
              {t(`${I18N_PATH}Service`)}
            </Typography>
          </TableHeadCell>
          <TableHeadCell right>
            <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
              {t(`${I18N_PATH}Amount`, { currency: currencySymbol })}
            </Typography>
          </TableHeadCell>
        </TableHeader>
        <TableBody loading={loading} cells={5} noResult={subscriptions?.length === 0}>
          {subscriptions?.map((subscription, index) => (
            <SubscriptionExpandableRow key={`subscription_${index}`} subscription={subscription} />
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default observer(Subscriptions);
