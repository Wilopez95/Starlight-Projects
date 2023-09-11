import React, { useContext } from 'react';

import { OptionGroup } from '../../Dropdown/components';
import { AutocompleteContext } from '../contexts';

import type { AutocompleteChildrenType, AutocompleteConfigType } from './types';

export const AutocompleteConfig: React.FC<AutocompleteConfigType> = ({
  children,
  name,
  showFooterIfEmpty = false,
  ...optionGroupProps
}) => {
  const { optionItemsGenerator } = useContext(AutocompleteContext);
  const [optionTemplate, footerTemplate] = React.Children.toArray(
    children,
  ) as AutocompleteChildrenType;
  const data = optionItemsGenerator({
    name,
    showFooterIfEmpty,
    template: optionTemplate,
    footerTemplate,
  });

  if (data === null && !showFooterIfEmpty) {
    return null;
  }

  return <OptionGroup {...optionGroupProps}>{data}</OptionGroup>;
};
