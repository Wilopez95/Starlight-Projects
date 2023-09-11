import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import ChangeReasonQuickViewContent from './ChangeReasonQuickViewContent';

const ChangeReasonQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { changeReasonStore } = useStores();

  return (
    <QuickView store={changeReasonStore} {...quickViewProps}>
      <ChangeReasonQuickViewContent />
    </QuickView>
  );
};

export default observer(ChangeReasonQuickView);
