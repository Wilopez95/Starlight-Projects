import React from 'react';
import { SelectComponentsConfig } from 'react-select';

import { ISelectOption } from '../../types';

export const Container: SelectComponentsConfig<ISelectOption, boolean>['SelectContainer'] = ({
  children,
  selectProps,
  getStyles,
  innerProps,
  ...props
}) => {
  return (
    <div
      style={getStyles('container', props)}
      data-error={selectProps.error}
      {...(innerProps as any)}
    >
      {children}
    </div>
  );
};
