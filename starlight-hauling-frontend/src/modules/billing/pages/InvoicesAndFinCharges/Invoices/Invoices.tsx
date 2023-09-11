import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCleanup, usePermission, useQueryParams, useStores } from '@hooks';

import { TableInfiniteScroll, TableTools } from '../../../../../common/TableTools';
import { CustomerSubscriptionParams } from '../../../../../components/PageLayouts/CustomerSubscriptionLayout/types';
import { Paths, Routes } from '../../../../../consts';
import { NotificationHelper, pathToUrl } from '../../../../../helpers';
import { Invoice } from '../../../entities';
import { InvoiceQuickView, InvoiceTable } from '../../../Invoices/components';
import { InvoicePageParams } from '../types';

import { IInvoicesPage, IInvoicesPageHandle } from './types';

const Invoices: React.ForwardRefRenderFunction<IInvoicesPageHandle, IInvoicesPage> = (
  { filters, query, children },
  ref,
) => {
  const { invoiceStore } = useStores();
  const { subscriptionId, customerId } = useParams<CustomerSubscriptionParams>();

  useCleanup(invoiceStore, 'ID', 'desc');

  const isCustomerSubscriptionInvoices = useMemo(
    () => !!customerId && !!subscriptionId,
    [customerId, subscriptionId],
  );
  const { businessUnitId } = useBusinessContext();

  const tableBodyContainerRef = useRef<HTMLTableSectionElement>(null);
  const canAccessInvoices = usePermission('billing/invoices:invoices:perform');

  const loadMore = useCallback(() => {
    if (!canAccessInvoices) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      invoiceStore.markLoaded();

      return;
    }
    invoiceStore.request(+businessUnitId, +customerId, +subscriptionId, { query, filters });
  }, [canAccessInvoices, invoiceStore, businessUnitId, filters, query, customerId, subscriptionId]);

  const queryParams = useQueryParams();
  const { id } = useParams<InvoicePageParams>();
  const orderId = queryParams.get('orderId');

  useEffect(() => {
    if (orderId && canAccessInvoices) {
      invoiceStore.requestDetailedByOrderId(orderId);
    }
  }, [canAccessInvoices, invoiceStore, orderId]);

  useEffect(() => {
    if (id) {
      const queryFunc = async () => {
        const invoice = await invoiceStore.requestDetailed(+id);

        if (invoice) {
          invoiceStore.selectEntity(invoice);
        }
      };

      queryFunc();
    }
  }, [id, invoiceStore]);

  const requestData = useCallback(() => {
    invoiceStore.cleanup();
    loadMore();
  }, [invoiceStore, loadMore]);

  useEffect(() => {
    invoiceStore.cleanup();

    if (!canAccessInvoices) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      invoiceStore.markLoaded();

      return;
    }

    invoiceStore.request(+businessUnitId, +customerId, +subscriptionId, { filters, query });
  }, [
    invoiceStore,
    businessUnitId,
    filters,
    query,
    canAccessInvoices,
    isCustomerSubscriptionInvoices,
    customerId,
    subscriptionId,
  ]);

  const handleRowClick = useCallback(
    (invoice: Invoice) => {
      invoiceStore.selectEntity(invoice);
    },
    [invoiceStore],
  );

  const closeUrl = pathToUrl(Paths.BillingModule.Invoices, {
    businessUnit: businessUnitId,
    subPath: Routes.Invoices,
    id: undefined,
  });

  const openUrl = pathToUrl(Paths.BillingModule.Invoices, {
    businessUnit: businessUnitId,
    subPath: Routes.Invoices,
    id: invoiceStore.selectedEntity?.id,
  });
  const urls = !isCustomerSubscriptionInvoices ? { openUrl, closeUrl } : {};

  useImperativeHandle(
    ref,
    () => {
      return {
        requestData,
      };
    },
    [requestData],
  );

  return (
    <>
      <InvoiceQuickView
        isOpen={invoiceStore.isOpenQuickView}
        clickOutContainers={tableBodyContainerRef}
        {...urls}
      />
      <TableTools.ScrollContainer>
        {children}
        <InvoiceTable
          showCustomer={!isCustomerSubscriptionInvoices}
          selectable
          tableBodyContainer={tableBodyContainerRef}
          onSort={loadMore}
          onSelect={handleRowClick}
        />
        <TableInfiniteScroll
          onLoaderReached={loadMore}
          loaded={invoiceStore.loaded}
          loading={invoiceStore.loading}
          initialRequest={false}
        >
          Loading Invoices
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(Invoices, { forwardRef: true });
