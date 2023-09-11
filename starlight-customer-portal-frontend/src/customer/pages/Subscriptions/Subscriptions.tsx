import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { CustomerNavigation, CustomerPortalLayout } from '@root/customer/layouts';
import { SubscriptionsGrid } from '@root/orders-and-subscriptions/components';

const SubscriptionsPage: React.FC = () => {
  const navigationRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  return (
    <CustomerPortalLayout>
      <Helmet title={t('Titles.Subscriptions')} />
      <CustomerNavigation ref={navigationRef} />
      <SubscriptionsGrid ref={navigationRef} />
    </CustomerPortalLayout>
  );
};

export default observer(SubscriptionsPage);
