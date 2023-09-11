import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import ChatQuickViewContent from './ChatQuickViewContent';

const ChatQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { chatStore } = useStores();

  return (
    <QuickView store={chatStore} {...quickViewProps}>
      <ChatQuickViewContent />
    </QuickView>
  );
};

export default observer(ChatQuickView);
