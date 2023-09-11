import React from 'react';

import { ICustomQuickView, QuickView } from '../../../../../common';
import { useStores } from '../../../../../hooks';

import SettlementQuickViewContent from './SettlementQuickViewContent';

const SettlementQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { settlementStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={settlementStore} size="three-quarters">
      <SettlementQuickViewContent />
    </QuickView>
  );
};

export default SettlementQuickView;
