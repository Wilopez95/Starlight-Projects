import React from 'react';

import { IQuickView, QuickView } from '@root/quickViews';

import ReminderQuickViewContent from './ReminderQuickViewContent';

const ReminderQuickView: React.FC<IQuickView> = ({ ...quickViewProps }) => {
  return <QuickView {...quickViewProps}>{() => <ReminderQuickViewContent />}</QuickView>;
};

export default ReminderQuickView;
