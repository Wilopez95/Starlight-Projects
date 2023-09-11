import React from 'react';
import { components, SelectComponentsConfig } from 'react-select';
import { get } from 'lodash-es';

import { ISelectOption } from '../../../types';

export const AutocompleteInput: SelectComponentsConfig<ISelectOption, boolean>['Input'] = props => {
  const selectedValue = get(props, 'selectProps.selectedValue', undefined);

  const isDisabled = !!selectedValue || props.isDisabled;

  return <components.Input {...props} isDisabled={isDisabled} />;
};
