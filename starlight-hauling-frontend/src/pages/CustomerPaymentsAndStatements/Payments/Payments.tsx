import React, { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll } from '@root/common/TableTools';
import { Paths, Routes } from '@root/consts';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCleanup, usePermission, useStores } from '@root/hooks';
import { Payment } from '@root/modules/billing/entities';
import { PaymentQuickView, PaymentsTable } from '@root/modules/billing/Payments/components';
import { CustomerStyles } from '@root/pages/Customer';

import { IPaymentTable, IPaymentTableParams } from './types';

const Payments: React.FC<IPaymentTable> = ({ filters, query, children }) => {
  const { paymentStore, customerStore } = useStores();
  const tableRef = useRef<HTMLTableElement>(null);
  const { businessUnitId } = useBusinessContext();

  const selectedCustomer = customerStore.selectedEntity;
  const selectedPayment = paymentStore.selectedEntity;

  const { id } = useParams<IPaymentTableParams>();
  const canAccessPayments = usePermission('billing/payments:payments:view');

  useCleanup(paymentStore, 'DATE', 'desc');

  const loadPayments = useCallback(() => {
    if (!canAccessPayments) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      paymentStore.markLoaded();

      return;
    }

    if (selectedCustomer) {
      paymentStore.requestByCustomer(+selectedCustomer.id, { filters, query });
    }
  }, [canAccessPayments, selectedCustomer, paymentStore, filters, query]);

  useEffect(() => {
    if (!id) {
      return;
    }
    (async () => {
      const newPayment = await paymentStore.requestDetailed(+id);

      if (newPayment) {
        paymentStore.selectEntity(newPayment);
      }
    })();
  }, [id, paymentStore]);

  useEffect(() => {
    paymentStore.cleanup();
    loadPayments();
  }, [paymentStore, loadPayments]);

  const handleRowClick = useCallback(
    (payment: Payment) => {
      paymentStore.selectEntity(payment);
    },
    [paymentStore],
  );

  const paymentOpenUrl = pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
    customerId: selectedCustomer?.id,
    businessUnit: businessUnitId,
    subPath: Routes.Payments,
    id: selectedPayment?.id,
  });

  const paymentCloseUrl = pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
    customerId: selectedCustomer?.id,
    businessUnit: businessUnitId,
    subPath: Routes.Payments,
  });

  return (
    <>
      <PaymentQuickView
        isOpen={paymentStore.isOpenQuickView}
        clickOutContainers={tableRef}
        openUrl={paymentOpenUrl}
        onClose={paymentStore.closeQuickView}
        closeUrl={paymentCloseUrl}
      />
      <CustomerStyles.ScrollContainer>
        {children}
        <PaymentsTable onSort={loadPayments} onSelect={handleRowClick} tableRef={tableRef} />
        <TableInfiniteScroll
          onLoaderReached={loadPayments}
          loaded={paymentStore.loaded}
          loading={paymentStore.loading}
          initialRequest={false}
        >
          Loading Payments
        </TableInfiniteScroll>
      </CustomerStyles.ScrollContainer>
    </>
  );
};

export default observer(Payments);
