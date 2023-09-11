import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { ISelectOption } from '../../types';

export const MenuList: SelectComponentsConfig<ISelectOption, boolean>['MenuList'] = ({
  children,
  ...props
}) => {
  return <components.MenuList {...props}>{children}</components.MenuList>;
};
