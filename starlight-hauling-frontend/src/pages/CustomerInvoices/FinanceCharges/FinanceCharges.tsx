import React, { useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import { TableTools } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  FinanceChargeQuickView,
  FinanceChargeTable,
} from '@root/modules/billing/FinanceCharges/components';
import { IFinanceChargesPage } from '@root/modules/billing/types';
import { useCleanup, usePermission, useStores } from '@hooks';

const FinanceCharges: React.FC<IFinanceChargesPage> = ({ filters, query, children }) => {
  const { financeChargeStore, customerStore } = useStores();
  const canAccessFinCharges = usePermission('billing:finance-charges:full-access');

  useCleanup(financeChargeStore, 'ID');

  const currentCustomer = customerStore.selectedEntity;

  const tableBodyContainerRef = useRef<HTMLTableSectionElement>(null);

  const handleRequest = useCallback(() => {
    if (!canAccessFinCharges) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      financeChargeStore.markLoaded();

      return;
    }

    if (currentCustomer?.id) {
      financeChargeStore.requestByCustomer({
        customerId: currentCustomer.id,
        filters,
        query,
      });
    }
  }, [canAccessFinCharges, currentCustomer?.id, financeChargeStore, filters, query]);

  useEffect(() => {
    financeChargeStore.cleanup();
    handleRequest();
  }, [financeChargeStore, handleRequest]);

  return (
    <>
      <FinanceChargeQuickView
        isOpen={financeChargeStore.isOpenQuickView}
        clickOutContainers={tableBodyContainerRef}
      />
      <TableTools.ScrollContainer>
        {children}
        <FinanceChargeTable tableBodyContainer={tableBodyContainerRef} onRequest={handleRequest} />
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(FinanceCharges);
