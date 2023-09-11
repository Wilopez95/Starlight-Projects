import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import SubscriptionTable from '@root/components/SubscriptionTable/SubscriptionTable';

export const MySubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet title={t('Titles.MyRecentSubscriptions')} />
      <SubscriptionTable mine />
    </>
  );
};
