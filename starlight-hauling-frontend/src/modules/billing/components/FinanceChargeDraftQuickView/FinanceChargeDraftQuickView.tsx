import React from 'react';

import { QuickView } from '@root/common/QuickView';

import { useStores } from '../../../../hooks';

import FinanceChargeDraftQuickViewContent from './FinanceChargeDraftQuickViewContent';
import { IFinanceChargeDraftQuickView } from './types';

const FinanceChargeDraftQuickView: React.FC<IFinanceChargeDraftQuickView> = ({
  statementIds,
  ...quickViewProps
}) => {
  const { financeChargeStore } = useStores();

  return (
    <QuickView
      {...quickViewProps}
      store={financeChargeStore}
      shouldDeselect={false}
      size="three-quarters"
      overlay
    >
      <FinanceChargeDraftQuickViewContent statementIds={statementIds} />
    </QuickView>
  );
};

export default FinanceChargeDraftQuickView;
