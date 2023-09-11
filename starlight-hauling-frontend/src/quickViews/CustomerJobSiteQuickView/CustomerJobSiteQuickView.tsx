import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import CustomerJobSiteQuickViewContent from './CustomerJobSiteQuickViewContent';

const CustomerJobSiteQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { jobSiteStore } = useStores();

  return (
    <QuickView store={jobSiteStore} size="half" {...quickViewProps}>
      <CustomerJobSiteQuickViewContent />
    </QuickView>
  );
};

export default CustomerJobSiteQuickView;
