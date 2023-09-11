import React, { useCallback, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { ActionCode } from '@root/helpers/notifications/types';

import { TableInfiniteScroll, TablePageContainer, TableTools } from '../../../../common/TableTools';
import { Paths } from '../../../../consts';
import { NotificationHelper, pathToUrl } from '../../../../helpers';
import { useBusinessContext, usePermission, useStores } from '../../../../hooks';
import { OrderEdit, OrderQuickView } from '../../../../quickViews';
import { Payment } from '../../Payments/store/Payment';
import DeferredPaymentsTable from '../components/DeferredPaymentsTable/DeferredPaymentsTable';
import Header from '../components/Header/Header';

import { DeferredPaymentsParams } from './types';

const DeferredPayments: React.FC = () => {
  const { paymentStore, orderStore } = useStores();

  const history = useHistory();

  const tableContainerRef = useRef<HTMLTableSectionElement>(null);
  const pageContainer = useRef<HTMLDivElement>(null);

  const { businessUnitId } = useBusinessContext();
  const { id, paymentId } = useParams<DeferredPaymentsParams>();

  const canAccessDeferredPayments = usePermission('billing:deferred-payments:full-access');

  //Special copy useCleanup for deferred payments
  useEffect(() => {
    paymentStore.setDeferredSort('DEFERRED_UNTIL', 'desc');

    return () => {
      paymentStore.cleanup();
      paymentStore.unSelectEntity();
    };
  }, [paymentStore]);

  const loadMore = useCallback(() => {
    if (!canAccessDeferredPayments) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      paymentStore.markLoaded();

      return;
    }

    paymentStore.requestDeferredByBU(+businessUnitId);
  }, [canAccessDeferredPayments, paymentStore, businessUnitId]);

  const handleGetDeferredPayments = useCallback(() => {
    paymentStore.cleanup();
    loadMore();
  }, [loadMore, paymentStore]);

  useEffect(() => {
    if (id) {
      orderStore.requestById(Number(id), true);
    }
    if (paymentId) {
      const payment = paymentStore.values.find(paym => Number(paym.id) === Number(paymentId));

      if (payment) {
        paymentStore.selectEntity(payment);
      }
    }
  }, [orderStore, paymentStore, paymentStore.values, id, paymentId]);

  const handleRowClick = useCallback(
    (payment: Payment) => {
      if (payment.orders?.[0].id === id) {
        orderStore.requestById(Number(id), true);
      } else {
        const newPath = pathToUrl(Paths.BillingModule.DeferredPayments, {
          businessUnit: businessUnitId,
          paymentId: payment.id,
          id: payment.orders?.[0].id,
        });

        history.push(newPath);
      }
      paymentStore.selectEntity(payment);
    },
    [businessUnitId, history, paymentStore, id, orderStore],
  );

  const handleClose = useCallback(() => {
    paymentStore.unSelectEntity();
    orderStore.unSelectEntity();
    const newPath = pathToUrl(Paths.BillingModule.DeferredPayments, {
      businessUnit: businessUnitId,
      paymentId: undefined,
      id: undefined,
    });

    history.push(newPath);
  }, [businessUnitId, history, orderStore, paymentStore]);

  return (
    <TablePageContainer ref={pageContainer}>
      <OrderQuickView
        clickOutContainers={tableContainerRef}
        isOpen={orderStore.isOpenQuickView}
        onClose={handleClose}
        onReschedule={handleGetDeferredPayments}
        shouldDeselect={!(orderStore.detailsOpen || orderStore.editOpen)}
      />
      <OrderEdit isOpen={orderStore.editOpen} isDeferredPage />
      <Header onRequest={loadMore} />
      <TableTools.ScrollContainer>
        <DeferredPaymentsTable
          tableBodyContainer={tableContainerRef}
          onSort={loadMore}
          onSelect={handleRowClick}
        />
        <TableInfiniteScroll
          onLoaderReached={loadMore}
          loaded={paymentStore.loaded}
          loading={paymentStore.loading}
        >
          Loading Deferred Payments
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(DeferredPayments);
