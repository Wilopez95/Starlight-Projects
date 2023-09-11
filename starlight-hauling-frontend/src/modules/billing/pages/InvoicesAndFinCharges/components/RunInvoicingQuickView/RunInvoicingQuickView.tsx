import React from 'react';

import { QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import RunInvoicingQuickViewContent from './RunInvoicingQuickViewContent';
import { type IRunInvoicingQuickView } from './types';

const RunInvoicingQuickView: React.FC<IRunInvoicingQuickView> = ({
  onInvoicesSave,
  ...quickViewProps
}) => {
  const { orderStore } = useStores();

  return (
    <QuickView {...quickViewProps} overlay store={orderStore} shouldDeselect={false}>
      <RunInvoicingQuickViewContent onInvoicesSave={onInvoicesSave} />
    </QuickView>
  );
};

export default RunInvoicingQuickView;
