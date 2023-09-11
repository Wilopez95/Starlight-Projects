import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';

import { ISelectOption } from '../../../types';

export const DropdownIndicator: SelectComponentsConfig<
  ISelectOption,
  boolean
>['DropdownIndicator'] = props => {
  const { selectedValue, onClear } = props.selectProps;

  if (!selectedValue) {
    return null;
  }

  return (
    <div onClick={onClear}>
      <components.ClearIndicator {...props} isDisabled={false} />
    </div>
  );
};
