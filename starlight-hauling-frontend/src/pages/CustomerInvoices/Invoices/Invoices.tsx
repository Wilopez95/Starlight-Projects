import React, { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll } from '@root/common/TableTools';
import { Paths, Routes } from '@root/consts';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { InvoiceQuickView, InvoiceTable } from '@root/modules/billing/Invoices/components';
import { IInvoicesPage } from '@root/modules/billing/types';
import { useBusinessContext, useCleanup, usePermission, useQueryParams, useStores } from '@hooks';

import { CustomerStyles } from '../../Customer';

import { CustomerInvoicesParams } from './types';

const Invoices: React.FC<IInvoicesPage> = ({ filters, query, children }) => {
  const { invoiceStore, customerStore } = useStores();
  const canAccessInvoices = usePermission('billing/invoices:invoices:perform');
  const { id, customerId } = useParams<CustomerInvoicesParams>();
  const { businessUnitId } = useBusinessContext();

  useCleanup(invoiceStore, 'ID');

  const currentCustomer = customerStore.selectedEntity;

  const tableBodyContainer = useRef<HTMLTableSectionElement>(null);

  const queryParams = useQueryParams();
  const subOrderId = queryParams.get('subOrderId');

  const requestInvoices = useCallback(() => {
    if (!canAccessInvoices) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      invoiceStore.markLoaded();

      return;
    }

    if (currentCustomer?.id) {
      invoiceStore.requestByCustomer({
        customerId: currentCustomer.id,
        filters,
        query,
      });
    }
  }, [canAccessInvoices, currentCustomer?.id, filters, invoiceStore, query]);

  useEffect(() => {
    if (id && +id !== invoiceStore.selectedEntity?.id) {
      invoiceStore.requestDetailed(+id, true);
    } else if (subOrderId) {
      invoiceStore.requestDetailedBySubOrderId(subOrderId);
    }
  }, [id, invoiceStore, subOrderId]);

  useEffect(() => {
    invoiceStore.cleanup();
    requestInvoices();
  }, [invoiceStore, requestInvoices]);

  const closeUrl = pathToUrl(Paths.CustomerModule.Invoices, {
    customerId,
    businessUnit: businessUnitId,
    subPath: Routes.Invoices,
    id: undefined,
  });

  const openUrl = pathToUrl(Paths.CustomerModule.Invoices, {
    customerId,
    businessUnit: businessUnitId,
    subPath: Routes.Invoices,
    id: invoiceStore.selectedEntity?.id,
  });

  return (
    <>
      <InvoiceQuickView
        isOpen={invoiceStore.isOpenQuickView}
        clickOutContainers={tableBodyContainer}
        openUrl={openUrl}
        closeUrl={closeUrl}
      />
      <CustomerStyles.ScrollContainer>
        {children}
        <InvoiceTable tableBodyContainer={tableBodyContainer} onSort={requestInvoices} selectable />
        <TableInfiniteScroll
          onLoaderReached={requestInvoices}
          loaded={invoiceStore.loaded}
          loading={invoiceStore.loading}
          initialRequest={false}
        >
          Loading Invoices
        </TableInfiniteScroll>
      </CustomerStyles.ScrollContainer>
    </>
  );
};

export default observer(Invoices);
