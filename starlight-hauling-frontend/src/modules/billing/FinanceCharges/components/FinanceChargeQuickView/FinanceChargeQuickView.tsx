import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';

import { useStores } from '../../../../../hooks';

import FinanceChargeQuickViewContent from './FinanceChargeQuickViewContent';

const FinanceChargeQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { financeChargeStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={financeChargeStore} size="three-quarters">
      <FinanceChargeQuickViewContent />
    </QuickView>
  );
};

export default FinanceChargeQuickView;
