import React, { useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll, TableTools } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCleanup, usePermission, useStores } from '@root/hooks';
import { Payout } from '@root/modules/billing/entities';
import { PayoutQuickView, PayoutsTable } from '@root/modules/billing/Payouts/components';

import { IPaymentSubPage } from '../types';

const Payouts: React.FC<IPaymentSubPage> = ({ filters, query, children }) => {
  const { payoutStore, customerStore } = useStores();
  const tableRef = useRef<HTMLTableElement>(null);

  const { businessUnitId } = useBusinessContext();

  const canAccessPayouts = usePermission('billing/payments:payout:perform');
  const canViewCustomers = usePermission('customers:view:perform');

  useCleanup(payoutStore, 'DATE', 'desc');

  useEffect(() => {
    if (!canAccessPayouts) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      payoutStore.markLoaded();

      return;
    }

    payoutStore.cleanup();
    payoutStore.requestByBU(+businessUnitId, { filters, query });
  }, [payoutStore, businessUnitId, filters, query, canAccessPayouts]);

  const handleRowClick = useCallback(
    async (payout: Payout) => {
      payoutStore.selectEntity(payout);
      if (canViewCustomers) {
        await customerStore.requestById(payout.customer?.id);
      }
    },
    [payoutStore, canViewCustomers, customerStore],
  );

  const loadPayouts = useCallback(() => {
    payoutStore.requestByBU(+businessUnitId, { filters, query });
  }, [payoutStore, businessUnitId, filters, query]);

  return (
    <>
      <PayoutQuickView
        isOpen={payoutStore.isOpenQuickView}
        clickOutContainers={tableRef}
        showCustomer={true}
      />
      <TableTools.ScrollContainer>
        {children}
        <PayoutsTable
          onSelect={handleRowClick}
          onSort={loadPayouts}
          tableRef={tableRef}
          showCustomer={true}
        />
        <TableInfiniteScroll
          onLoaderReached={loadPayouts}
          loaded={payoutStore.loaded}
          loading={payoutStore.loading}
          initialRequest={false}
        >
          Loading Payouts
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(Payouts);
