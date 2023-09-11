import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { ISelectOption } from '../../../types';

export const NoOptionsMessage: SelectComponentsConfig<
  ISelectOption,
  boolean
>['NoOptionsMessage'] = ({ children, ...props }) => {
  const { minSearchLength = 0, inputValue = '' } = props.selectProps;

  if (inputValue.length < minSearchLength) {
    return null;
  }

  return <components.NoOptionsMessage {...props}>{children}</components.NoOptionsMessage>;
};
