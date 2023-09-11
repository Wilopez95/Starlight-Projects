import React from 'react';

import { ICustomQuickView, QuickView, QuickViewPaths } from '../../../../../common';
import { useStores } from '../../../../../hooks';

import InvoiceQuickViewContent from './InvoiceQuickViewContent';

const InvoiceQuickView: React.FC<ICustomQuickView & QuickViewPaths> = ({ ...quickViewProps }) => {
  const { invoiceStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={invoiceStore} size="three-quarters">
      <InvoiceQuickViewContent />
    </QuickView>
  );
};

export default InvoiceQuickView;
