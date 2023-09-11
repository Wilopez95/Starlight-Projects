import React, { createContext } from 'react';
import { noop } from 'lodash-es';

import { IAutocompleteOptionGroupData } from './types';

export const AutocompleteOptionContext = createContext<any>({});

export const AutocompleteOptionGroupContext = createContext<IAutocompleteOptionGroupData>({
  name: '',
  options: [],
  template: <></>,
  onSelect: noop,
});
