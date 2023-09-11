import React, { useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCleanup, usePermission, useStores } from '@root/hooks';
import { PayoutQuickView, PayoutsTable } from '@root/modules/billing/Payouts/components';
import { CustomerStyles } from '@root/pages/Customer';

import { IPayoutTable } from './types';

const Payouts: React.FC<IPayoutTable> = ({ filters, query, children }) => {
  const { payoutStore, customerStore } = useStores();
  const selectedCustomer = customerStore.selectedEntity;
  const tableRef = useRef<HTMLTableElement>(null);

  const canAccessPayouts = usePermission('billing/payments:payout:perform');

  useCleanup(payoutStore, 'DATE', 'desc');

  const loadPayouts = useCallback(() => {
    if (!canAccessPayouts) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      payoutStore.markLoaded();

      return;
    }

    if (selectedCustomer) {
      payoutStore.requestByCustomer(+selectedCustomer.id, { filters, query });
    }
  }, [canAccessPayouts, selectedCustomer, payoutStore, filters, query]);

  useEffect(() => {
    payoutStore.cleanup();
    loadPayouts();
  }, [loadPayouts, payoutStore]);

  return (
    <>
      <PayoutQuickView isOpen={payoutStore.isOpenQuickView} clickOutContainers={tableRef} />
      <CustomerStyles.ScrollContainer>
        {children}
        <PayoutsTable
          onSelect={item => payoutStore.selectEntity(item)}
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
      </CustomerStyles.ScrollContainer>
    </>
  );
};

export default observer(Payouts);
