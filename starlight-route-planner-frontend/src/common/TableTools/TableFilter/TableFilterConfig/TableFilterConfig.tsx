import React, { useContext } from 'react';

import { FilterConfigContext } from '../context';

import { ITableFilterConfig } from './types';

export const TableFilterConfig: React.FC<ITableFilterConfig> = ({
  label,
  filterByKey,
  children,
}) => {
  const { shouldRender } = useContext(FilterConfigContext);

  if (!shouldRender(label, filterByKey)) {
    return null;
  }

  return <>{children}</>;
};
