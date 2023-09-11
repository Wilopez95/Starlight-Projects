import React, { useEffect } from 'react';

import { TabsEnum } from './types';

interface IProps {
  tab: TabsEnum;
  onTabEnter(tab: TabsEnum): void;
}

export const TabRegistrator: React.FC<IProps> = ({ onTabEnter, tab, children }) => {
  useEffect(() => {
    onTabEnter(tab);
  }, [onTabEnter, tab]);

  return <>{children}</>;
};
