import React from 'react';

import * as PageStyles from '../styles';

import { SystemConfigurationPageHeader } from './Header/SystemConfigurationPageHeader';
import { SystemConfigurationNavigation } from './NavigationPanel/SystemConfigurationNavigation';

export const SystemConfigurationLayout: React.FC = ({ children }) => (
  <PageStyles.PageLayout>
    <SystemConfigurationPageHeader />
    <PageStyles.PageContainer>
      <SystemConfigurationNavigation />
      {children}
    </PageStyles.PageContainer>
  </PageStyles.PageLayout>
);
