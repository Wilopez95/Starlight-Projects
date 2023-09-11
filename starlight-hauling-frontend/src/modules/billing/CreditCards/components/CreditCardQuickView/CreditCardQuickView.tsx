import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView, QuickViewPaths } from '@root/common/QuickView';

import { useStores } from '../../../../../hooks';

import CreditCardQuickViewContent from './CreditCardQuickViewContent';
import { ICreditCardQuickView } from './types';

const CreditCardQuickView: React.FC<ICreditCardQuickView & ICustomQuickView & QuickViewPaths> = ({
  viewMode,
  ...quickViewProps
}) => {
  const { creditCardStore } = useStores();

  return (
    <QuickView store={creditCardStore} size="half" {...quickViewProps}>
      <CreditCardQuickViewContent viewMode={viewMode} />
    </QuickView>
  );
};

export default observer(CreditCardQuickView);
