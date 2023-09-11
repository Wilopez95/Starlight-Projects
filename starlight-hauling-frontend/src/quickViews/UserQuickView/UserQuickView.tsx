import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import UserQuickViewContent from './UserQuickViewContent';

const UserQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { userStore } = useStores();

  return (
    <QuickView store={userStore} size="half" {...quickViewProps}>
      <UserQuickViewContent />
    </QuickView>
  );
};

export default observer(UserQuickView);
