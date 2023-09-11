import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';

import { TableTools } from '../../../../../common/TableTools';
import { CustomerSubscriptionParams } from '../../../../../components/PageLayouts/CustomerSubscriptionLayout/types';
import { Paths, Routes } from '../../../../../consts';
import { useBusinessContext, useCleanup, usePermission, useStores } from '../../../../../hooks';
import { FinanceChargeQuickView, FinanceChargeTable } from '../../../FinanceCharges/components';

import { FinanceChargesPageParams, IFinanceChargesPage } from './types';

const FinanceCharges: React.FC<IFinanceChargesPage> = ({ filters, query, children }) => {
  const { financeChargeStore, customerStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const canAccessFinCharges = usePermission('billing:finance-charges:full-access');
  const { subscriptionId, customerId } = useParams<CustomerSubscriptionParams>();
  const { id } = useParams<FinanceChargesPageParams>();

  useCleanup(financeChargeStore, 'ID', 'desc');
  useCleanup(customerStore);

  const tableBodyContainerRef = useRef<HTMLTableSectionElement>(null);

  const isCustomerSubscriptionInvoices = useMemo(
    () => !!customerId && !!subscriptionId,
    [customerId, subscriptionId],
  );

  const handleRequest = useCallback(() => {
    if (!canAccessFinCharges) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      financeChargeStore.markLoaded();

      return;
    }

    financeChargeStore.request({
      businessUnitId: +businessUnitId,
      filters,
      query,
    });
  }, [canAccessFinCharges, financeChargeStore, businessUnitId, filters, query]);

  useEffect(() => {
    financeChargeStore.cleanup();
    handleRequest();
  }, [financeChargeStore, handleRequest]);

  useEffect(() => {
    if (id) {
      const queryFunc = async () => {
        const finCharge = await financeChargeStore.requestDetailed(+id);

        if (finCharge) {
          financeChargeStore.selectEntity(finCharge);
        }
      };

      queryFunc();
    }
  }, [id, financeChargeStore]);

  const closeUrl = pathToUrl(Paths.BillingModule.Invoices, {
    businessUnit: businessUnitId,
    subPath: Routes.FinanceCharges,
    id: undefined,
  });

  const openUrl = pathToUrl(Paths.BillingModule.Invoices, {
    businessUnit: businessUnitId,
    subPath: Routes.FinanceCharges,
    id: financeChargeStore.selectedEntity?.id,
  });

  const urls = !isCustomerSubscriptionInvoices ? { openUrl, closeUrl } : {};

  return (
    <>
      <FinanceChargeQuickView
        isOpen={financeChargeStore.isOpenQuickView}
        clickOutContainers={tableBodyContainerRef}
        {...urls}
      />
      <TableTools.ScrollContainer>
        {children}
        <FinanceChargeTable
          showCustomer
          tableBodyContainer={tableBodyContainerRef}
          onRequest={handleRequest}
        />
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(FinanceCharges);
