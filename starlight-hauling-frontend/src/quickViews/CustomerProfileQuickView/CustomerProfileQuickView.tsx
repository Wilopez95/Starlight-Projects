import React, { useCallback } from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import CustomerProfileQuickViewContent from './CustomerProfileQuickViewContent';

const ProfileQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { customerStore } = useStores();

  const handleClose = useCallback(() => {
    customerStore.toggleEditQuickView(false);
  }, [customerStore]);

  return (
    <QuickView
      {...quickViewProps}
      store={customerStore}
      onClose={handleClose}
      shouldDeselect={false}
      size="half"
    >
      <CustomerProfileQuickViewContent />
    </QuickView>
  );
};

export default ProfileQuickView;
