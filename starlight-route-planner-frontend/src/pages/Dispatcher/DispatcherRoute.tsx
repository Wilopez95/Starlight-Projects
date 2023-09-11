import React from 'react';
import { Route } from 'react-router-dom';

import { TabRegistrator } from './TabRegistator';
import { TabsEnum } from './types';

interface IProps {
  path: string;
  tab: TabsEnum;
  onTabEnter(tab: TabsEnum): void;
}

export const DispatcherRoute: React.FC<IProps> = ({ children, path, tab, onTabEnter }) => (
  <Route path={path}>
    <TabRegistrator tab={tab} onTabEnter={onTabEnter}>
      {children}
    </TabRegistrator>
  </Route>
);
