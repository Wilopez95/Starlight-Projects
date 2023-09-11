import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import EquipmentItemsQuickViewContent from './EquipmentItemsQuickViewContent';

const EquipmentItemsQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { equipmentItemStore } = useStores();

  return (
    <QuickView store={equipmentItemStore} {...quickViewProps}>
      <EquipmentItemsQuickViewContent />
    </QuickView>
  );
};

export default observer(EquipmentItemsQuickView);
