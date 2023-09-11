import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import RecyclingCustomerTrucks from '@starlightpro/recycling/views/CustomerTrucks';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { CustomerNavigation, CustomerStyles } from '../Customer';

export interface ICustomerTrucks {
  sidePanelContainer?: HTMLElement | null;
}

const CustomerTrucks: React.FC<ICustomerTrucks> = ({ sidePanelContainer }) => {
  const { customerStore } = useStores();
  const { t } = useTranslation();

  const customer = customerStore.selectedEntity;

  if (!customer) {
    return null;
  }

  return (
    <>
      <Helmet title={t('Titles.CustomerTrucks', { customerName: customer.name })} />
      <CustomerNavigation />
      <CustomerStyles.PageContainer>
        <CustomerStyles.ScrollContainer>
          <RecyclingCustomerTrucks
            customerId={customer.id}
            sidePanelParentNode={sidePanelContainer}
          />
        </CustomerStyles.ScrollContainer>
      </CustomerStyles.PageContainer>
    </>
  );
};

export default observer(CustomerTrucks);
