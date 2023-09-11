import { createContext } from 'react';
import { noop } from 'lodash-es';

import { AutocompleteOptionGroupGenerator, IAutocompleteContext } from './types';

export const AutocompleteChildrenContext = createContext<any>({});

export const AutocompleteContext = createContext<IAutocompleteContext>({
  loading: false,
  onClear: noop,
  onHide: noop,
  onShow: noop,
  optionItemsGenerator: noop as AutocompleteOptionGroupGenerator,
});
