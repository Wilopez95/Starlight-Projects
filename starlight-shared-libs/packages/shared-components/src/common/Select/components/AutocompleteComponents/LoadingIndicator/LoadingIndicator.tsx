import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { ISelectOption } from '../../../types';

export const LoadingIndicator: SelectComponentsConfig<
  ISelectOption,
  boolean
>['LoadingIndicator'] = ({ children, ...props }) => {
  const { minSearchLength = 0, inputValue = '' } = props.selectProps;

  if (inputValue.length < minSearchLength) {
    return null;
  }

  return <components.LoadingIndicator {...props}>{children}</components.LoadingIndicator>;
};
