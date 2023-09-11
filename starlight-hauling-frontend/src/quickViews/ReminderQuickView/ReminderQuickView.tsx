import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import ReminderQuickViewContent from './ReminderQuickViewContent';

const ReminderQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { reminderStore } = useStores();

  return (
    <QuickView store={reminderStore} shouldDeselect={false} {...quickViewProps}>
      <ReminderQuickViewContent />
    </QuickView>
  );
};

export default ReminderQuickView;
