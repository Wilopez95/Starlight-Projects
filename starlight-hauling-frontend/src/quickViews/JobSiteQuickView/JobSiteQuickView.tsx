import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView, QuickViewPaths } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import JobSiteQuickViewContent from './JobSiteQuickViewContent';

const JobSiteQuickView: React.FC<ICustomQuickView & QuickViewPaths> = ({ ...quickViewProps }) => {
  const { jobSiteStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={jobSiteStore} size="half">
      <JobSiteQuickViewContent />
    </QuickView>
  );
};

export default observer(JobSiteQuickView);
