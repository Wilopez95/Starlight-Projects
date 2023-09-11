import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { ISelectOption } from '../../../types';

export const LoadingMessage: SelectComponentsConfig<ISelectOption, boolean>['LoadingMessage'] = ({
  children,
  ...props
}) => {
  const { minSearchLength = 0, inputValue = '' } = props.selectProps;

  if (inputValue.length < minSearchLength) {
    return null;
  }

  return <components.LoadingMessage {...props}>{children}</components.LoadingMessage>;
};
