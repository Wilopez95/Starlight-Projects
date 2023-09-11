import React, { useCallback } from 'react';
import { InitQueryFuncType } from '@starlightpro/recycling/hooks/useAdditionalOrderData';
import { observer } from 'mobx-react-lite';

import CustomerJobSiteOrderTable from '@root/components/CustomerJobSiteOrderTable/CustomerJobSiteOrderTable';
import { CustomerJobSiteNavigation } from '@root/components/PageLayouts/CustomerJobSiteLayout';
import { Paths } from '@root/consts';
import { useStores } from '@root/hooks';

import { ICustomerJobSiteSubPage } from '../CustomerJobSites/types';

const CustomerJobSitesOpenOrders: React.FC<ICustomerJobSiteSubPage> = ({ search, projectId }) => {
  const { orderStore, customerStore, jobSiteStore } = useStores();

  const selectedCustomer = customerStore.selectedEntity;
  const selectedJobSite = jobSiteStore.selectedEntity;

  const customerId = selectedCustomer?.id;
  const jobSiteId = selectedJobSite?.id;

  const handleRequestOpenOrders = useCallback(
    (fetchAdditionalOrderData?: InitQueryFuncType) => {
      if (search && search.length < 3) {
        orderStore.cleanup();
        orderStore.markLoaded();
      } else if (customerId && jobSiteId) {
        orderStore.requestOpenOrders(customerId, jobSiteId, projectId, fetchAdditionalOrderData);
      }
    },
    [customerId, jobSiteId, orderStore, projectId, search],
  );

  return (
    <>
      <CustomerJobSiteNavigation />
      <CustomerJobSiteOrderTable
        onRequest={handleRequestOpenOrders}
        basePath={Paths.CustomerJobSiteModule.OpenOrders}
      />
    </>
  );
};

export default observer(CustomerJobSitesOpenOrders);
