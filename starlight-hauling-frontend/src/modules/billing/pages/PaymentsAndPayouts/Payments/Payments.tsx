import React, { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll, TableTools } from '@root/common/TableTools';
import { Paths, Routes } from '@root/consts';
import { NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCleanup, usePermission, useStores } from '@root/hooks';
import { Payment } from '@root/modules/billing/entities';
import { PaymentQuickView, PaymentsTable } from '@root/modules/billing/Payments/components';

import { IPaymentSubPage, PaymentParams } from '../types';

const Payments: React.FC<IPaymentSubPage> = ({ filters, query, children }) => {
  const { paymentStore, customerStore } = useStores();
  const tableRef = useRef<HTMLTableElement>(null);

  const { businessUnitId } = useBusinessContext();

  const { id } = useParams<PaymentParams>();

  useCleanup(paymentStore, 'DATE', 'desc');

  const canAccessPayments = usePermission('billing/payments:payments:view');

  const loadPayments = useCallback(() => {
    if (!canAccessPayments) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      paymentStore.markLoaded();

      return;
    }

    paymentStore.requestByBU(+businessUnitId, { filters, query });
  }, [canAccessPayments, paymentStore, businessUnitId, filters, query]);

  useEffect(() => {
    paymentStore.cleanup();
    loadPayments();
  }, [paymentStore, loadPayments]);

  useEffect(() => {
    (async () => {
      if (id) {
        const newPayment = await paymentStore.requestDetailed(+id);

        if (newPayment) {
          paymentStore.selectEntity(newPayment);
        }
      } else {
        paymentStore.toggleQuickView(false);
      }
    })();
  }, [id, paymentStore]);

  const handleRowClick = useCallback(
    async (payment: Payment) => {
      customerStore.unSelectEntity();
      paymentStore.selectEntity(payment);
      await customerStore.requestById(payment.customer?.id);
    },
    [paymentStore, customerStore],
  );

  const paymentCloseUrl = pathToUrl(Paths.BillingModule.PaymentsAndPayouts, {
    businessUnit: businessUnitId,
    subPath: Routes.Payments,
    id: undefined,
  });

  const paymentOpenUrl = pathToUrl(Paths.BillingModule.PaymentsAndPayouts, {
    businessUnit: businessUnitId,
    subPath: Routes.Payments,
    id: paymentStore.selectedEntity?.id,
  });

  return (
    <>
      <PaymentQuickView
        isOpen={paymentStore.isOpenQuickView}
        clickOutContainers={tableRef}
        showCustomer={true}
        onClose={paymentStore.closeQuickView}
        openUrl={paymentOpenUrl}
        closeUrl={paymentCloseUrl}
      />
      <TableTools.ScrollContainer>
        {children}
        <PaymentsTable
          onSelect={handleRowClick}
          tableRef={tableRef}
          showCustomer={true}
          onSort={loadPayments}
        />
        <TableInfiniteScroll
          onLoaderReached={loadPayments}
          loaded={paymentStore.loaded}
          loading={paymentStore.loading}
          initialRequest={false}
        >
          Loading Payments
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(Payments);
