import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import ProjectQuickViewContent from './ProjectQuickViewContent';

const ProjectQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { projectStore } = useStores();

  return (
    <QuickView store={projectStore} {...quickViewProps}>
      <ProjectQuickViewContent />
    </QuickView>
  );
};

export default ProjectQuickView;
