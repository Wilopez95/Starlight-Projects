import React, { useCallback, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCleanup, usePermission, useStores } from '@root/hooks';
import { FinanceChargeDraftQuickView } from '@root/modules/billing/components';
import { StatementQuickView, StatementsTable } from '@root/modules/billing/Statements/components';
import { CustomerStyles } from '@root/pages/Customer';

const Statements: React.FC = ({ children }) => {
  const { statementStore, customerStore } = useStores();
  const [statementsIds, setStatementsIds] = useState<number[]>([]);
  const selectedCustomer = customerStore.selectedEntity;
  const tableRef = useRef<HTMLTableElement>(null);

  const canAccessStatements = usePermission('billing:batch-statements:full-access');

  useCleanup(statementStore, 'STATEMENT_DATE', 'desc');

  const handleCleanUpStatements = useCallback(() => {
    setStatementsIds([]);
  }, []);

  const loadStatements = useCallback(() => {
    if (!canAccessStatements) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      statementStore.markLoaded();

      return;
    }

    if (selectedCustomer) {
      statementStore.requestByCustomer(+selectedCustomer.id);
    }
  }, [canAccessStatements, selectedCustomer, statementStore]);

  useEffect(() => {
    statementStore.cleanup();
    loadStatements();
  }, [statementStore, loadStatements]);

  return (
    <>
      <FinanceChargeDraftQuickView
        statementIds={statementsIds}
        isOpen={statementsIds.length !== 0}
        onClose={handleCleanUpStatements}
      />
      <StatementQuickView
        isOpen={statementStore.isOpenQuickView}
        onFinanceChargeQuickViewOpen={setStatementsIds}
        clickOutContainers={tableRef}
        request={loadStatements}
      />
      <CustomerStyles.ScrollContainer>
        {children}
        <StatementsTable
          onSelect={item => statementStore.selectEntity(item)}
          tableRef={tableRef}
          onSort={loadStatements}
        />
        <TableInfiniteScroll
          onLoaderReached={loadStatements}
          loaded={statementStore.loaded}
          loading={statementStore.loading}
          initialRequest={false}
        >
          Loading Statements
        </TableInfiniteScroll>
      </CustomerStyles.ScrollContainer>
    </>
  );
};

export default observer(Statements);
