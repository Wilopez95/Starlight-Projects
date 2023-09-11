import React from 'react';

import { ITableFilterConfig } from './types';

export const TableFilterConfig: React.FC<ITableFilterConfig> = ({ children }) => {
  if (React.isValidElement(children)) {
    return <>{children}</>;
  }

  return null;
};
