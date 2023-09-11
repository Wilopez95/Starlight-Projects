import React from 'react';

import { ICustomQuickView, QuickView, QuickViewPaths } from '@root/common/QuickView';
import { IQuickViewLeftPanel } from '@root/quickViews/types';

import { useStores } from '../../../../../hooks';

import PaymentQuickViewContent from './PaymentQuickViewContent';

const PaymentQuickView: React.FC<IQuickViewLeftPanel & ICustomQuickView & QuickViewPaths> = ({
  showCustomer = false,
  ...quickViewProps
}) => {
  const { paymentStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={paymentStore} size="three-quarters">
      <PaymentQuickViewContent showCustomer={showCustomer} />
    </QuickView>
  );
};

export default PaymentQuickView;
