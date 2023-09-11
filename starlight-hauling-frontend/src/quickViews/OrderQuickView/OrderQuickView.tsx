import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView, QuickViewContent } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import ButtonContainer from './ButtonContainer/ButtonContainer';
import RightPanel from './RightPanel/RightPanel';
import { IOrderQuickView } from './types';

const OrderQuickView: React.FC<IOrderQuickView & ICustomQuickView> = ({
  onReschedule,
  ...quickViewProps
}) => {
  const { orderStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={orderStore}>
      <QuickViewContent
        rightPanelElement={<RightPanel onReschedule={onReschedule} />}
        actionsElement={<ButtonContainer />}
      />
    </QuickView>
  );
};

export default observer(OrderQuickView);
