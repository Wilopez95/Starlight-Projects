import React from 'react';
import { NavigationPanel } from '@starlightpro/shared-components';

import BusinessLinesNavigationItems from './BusinessLinesNavigationItems';
import { ConfigurationNavigationItems } from './ConfigurationNavigationItems';

export const SystemConfigurationNavigation: React.FC = () => (
  <NavigationPanel>
    <li role="menuitem">
      <ConfigurationNavigationItems />
      <BusinessLinesNavigationItems />
    </li>
  </NavigationPanel>
);
