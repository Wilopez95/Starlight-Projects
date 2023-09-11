import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import BankDepositQuickViewContent from './BankDepositQuickViewContent';

const BankDepositQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { bankDepositStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={bankDepositStore} size="three-quarters">
      <BankDepositQuickViewContent />
    </QuickView>
  );
};

export default BankDepositQuickView;
