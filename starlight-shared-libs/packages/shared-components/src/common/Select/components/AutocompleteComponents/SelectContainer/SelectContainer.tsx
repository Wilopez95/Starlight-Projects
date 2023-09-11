import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';
import { get } from 'lodash-es';

import { ISelectOption } from '../../../types';

export const SelectContainer: SelectComponentsConfig<ISelectOption, boolean>['SelectContainer'] = ({
  children,
  ...props
}) => {
  const Background = props.selectProps.background;
  const isFocused = get(props, 'isFocused', false);

  return (
    <>
      <components.SelectContainer {...props}>{children}</components.SelectContainer>
      {Background ? <Background expanded={isFocused} /> : null}
    </>
  );
};
