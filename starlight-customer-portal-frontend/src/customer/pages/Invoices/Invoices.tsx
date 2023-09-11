import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/core/hooks';
import { CustomerNavigation, CustomerPortalLayout } from '@root/customer/layouts';
import { Invoice } from '@root/finance/pages';
import { InvoiceType } from '@root/finance/types/entities';

const InvoicesPage: React.FC = () => {
  const { customerStore } = useStores();
  const customer = customerStore.selectedEntity!;
  const { t } = useTranslation();
  const navigationRef = useRef<HTMLDivElement>(null);

  return (
    <CustomerPortalLayout>
      <Helmet title={t('Titles.Invoices')} />
      <CustomerNavigation ref={navigationRef} />
      {customer && (
        <Invoice tabContainer={navigationRef} customerId={customer.id} type={InvoiceType.orders} />
      )}
    </CustomerPortalLayout>
  );
};

export default observer(InvoicesPage);
