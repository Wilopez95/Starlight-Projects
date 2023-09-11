import React, { FC, useCallback, useState } from 'react';
import {
  OrdersViewProps,
  refreshAllOrders,
} from '@starlightpro/recycling/views/OrdersView/OrdersView';

import {
  InvoicingStatusModal,
  RunInvoicingQuickView,
} from '@root/modules/billing/Invoices/components';
import { GenerateInvoicesRequest } from '@root/modules/billing/Invoices/types';
import { useBoolean } from '@hooks';

import RecyclingOrderTable from './RecyclingOrderTable';
import { RecyclingPageContainer, RecyclingScrollContainer } from './styles';

const RecyclingOrders: FC<Omit<OrdersViewProps, 'location' | 'LinkComponent'>> = props => {
  const [isOpenInvoiceView, openInvoiceView, closeInvoiceView] = useBoolean();
  const [isInvoicingSummaryOpen, openInvoicingSummary, closeInvoicingSummary] = useBoolean();
  const [invoicingRequestData, setInvoicingRequestData] = useState<GenerateInvoicesRequest>();

  const handleInvoicesSave = useCallback(
    (data: GenerateInvoicesRequest) => {
      setInvoicingRequestData(data);
      openInvoicingSummary();
    },
    [openInvoicingSummary],
  );
  const handleInvoicingSummaryClose = useCallback(() => {
    setInvoicingRequestData(undefined);
    closeInvoicingSummary();
  }, [closeInvoicingSummary]);

  return (
    <RecyclingPageContainer>
      <RecyclingScrollContainer>
        <RunInvoicingQuickView
          isOpen={isOpenInvoiceView}
          onClose={closeInvoiceView}
          onInvoicesSave={handleInvoicesSave}
        />
        {invoicingRequestData ? (
          <InvoicingStatusModal
            data={invoicingRequestData}
            onInvoicesGenerated={() => {
              refreshAllOrders();
            }}
            isOpen={isInvoicingSummaryOpen}
            onClose={handleInvoicingSummaryClose}
          />
        ) : null}
        <RecyclingOrderTable {...props} onInvoiceAllClick={openInvoiceView} />
      </RecyclingScrollContainer>
    </RecyclingPageContainer>
  );
};

export default RecyclingOrders;
