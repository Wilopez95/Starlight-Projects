import React, { useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll, TableTools } from '@root/common/TableTools';
import { CustomerJobSiteNavigation } from '@root/components/PageLayouts/CustomerJobSiteLayout';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { InvoiceQuickView, InvoiceTable } from '@root/modules/billing/Invoices/components';
import { useCleanup, usePermission, useStores } from '@hooks';

import { ICustomerJobSiteSubPage } from '../CustomerJobSites/types';

const CustomerJobSiteInvoice: React.FC<ICustomerJobSiteSubPage> = () => {
  const { invoiceStore, customerStore, jobSiteStore } = useStores();
  const canAccessInvoices = usePermission('billing/invoices:invoices:perform');

  const jobSiteNavigationRef = useRef<HTMLDivElement>(null);
  const currentCustomer = customerStore.selectedEntity;
  const currentJobsite = jobSiteStore.selectedEntity;

  const tableBodyContainer = useRef<HTMLTableSectionElement>(null);

  useCleanup(invoiceStore, 'ID', 'desc');

  const loadMore = useCallback(() => {
    if (!canAccessInvoices) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      invoiceStore.markLoaded();

      return;
    }

    if (currentCustomer) {
      invoiceStore.requestByCustomer({
        customerId: currentCustomer.id,
        jobsiteId: currentJobsite?.id,
      });
    }
  }, [canAccessInvoices, currentCustomer, currentJobsite?.id, invoiceStore]);

  useEffect(() => {
    invoiceStore.cleanup();
    loadMore();
  }, [invoiceStore, loadMore]);

  return (
    <>
      <CustomerJobSiteNavigation ref={jobSiteNavigationRef} />
      <TableTools.ScrollContainer>
        <InvoiceQuickView
          isOpen={invoiceStore.isOpenQuickView}
          clickOutContainers={tableBodyContainer}
        />
        <InvoiceTable tableBodyContainer={tableBodyContainer} onSort={loadMore} />
        <TableInfiniteScroll
          onLoaderReached={loadMore}
          loaded={invoiceStore.loaded}
          loading={invoiceStore.loading}
        >
          Loading Invoices
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(CustomerJobSiteInvoice);
