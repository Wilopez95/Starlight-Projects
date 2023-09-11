import React from 'react';

import { ICustomQuickView, QuickView, QuickViewPaths } from '@root/common/QuickView';

import { useStores } from '../../../../../hooks';

import PayoutQuickViewContent from './PayoutQuickViewContent';

const PayoutQuickView: React.FC<ICustomQuickView & QuickViewPaths & { showCustomer?: boolean }> = ({
  showCustomer = false,
  ...quickViewProps
}) => {
  const { payoutStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={payoutStore} size="three-quarters">
      <PayoutQuickViewContent showCustomer={showCustomer} />
    </QuickView>
  );
};

export default PayoutQuickView;
