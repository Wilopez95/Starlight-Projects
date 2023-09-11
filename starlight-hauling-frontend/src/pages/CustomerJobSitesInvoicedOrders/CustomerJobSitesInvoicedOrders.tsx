import React, { useCallback } from 'react';
import { InitQueryFuncType } from '@starlightpro/recycling/hooks/useAdditionalOrderData';
import { observer } from 'mobx-react-lite';

import CustomerJobSiteOrderTable from '@root/components/CustomerJobSiteOrderTable/CustomerJobSiteOrderTable';
import { CustomerJobSiteNavigation } from '@root/components/PageLayouts/CustomerJobSiteLayout';
import { Paths } from '@root/consts';
import { useStores } from '@root/hooks';

import { ICustomerJobSiteSubPage } from '../CustomerJobSites/types';

const CustomerJobSitesInvoicedOrders: React.FC<ICustomerJobSiteSubPage> = ({ projectId }) => {
  const { orderStore, customerStore, jobSiteStore } = useStores();

  const selectedCustomer = customerStore.selectedEntity;
  const selectedJobSite = jobSiteStore.selectedEntity;

  const handleRequestInvoicedOrders = useCallback(
    (fetchAdditionalOrderData?: InitQueryFuncType) => {
      if (selectedCustomer && selectedJobSite) {
        orderStore.requestInvoicedOrders(
          selectedCustomer.id,
          selectedJobSite.id,
          projectId,
          fetchAdditionalOrderData,
        );
      }
    },
    [orderStore, projectId, selectedCustomer, selectedJobSite],
  );

  return (
    <>
      <CustomerJobSiteNavigation />
      <CustomerJobSiteOrderTable
        onRequest={handleRequestInvoicedOrders}
        basePath={Paths.CustomerJobSiteModule.InvoicedOrders}
      />
    </>
  );
};

export default observer(CustomerJobSitesInvoicedOrders);
