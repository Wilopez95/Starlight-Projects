import React from 'react';
import { ExtendButtonBase } from '@material-ui/core';
import Tab, { TabTypeMap } from '@material-ui/core/Tab';
import { ProtectedProps, Protected } from './Protected';

export const ProtectedTab: ExtendButtonBase<TabTypeMap<ProtectedProps>> = ({
  permissions,
  fallback,
  ...tabProps
}: any) => {
  return (
    <Protected permissions={permissions} fallback={fallback}>
      <Tab {...tabProps} />
    </Protected>
  );
};
