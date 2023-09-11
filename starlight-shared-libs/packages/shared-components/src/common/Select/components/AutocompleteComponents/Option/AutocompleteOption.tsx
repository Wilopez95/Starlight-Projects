import React, { useCallback, useContext } from 'react';
import { SelectComponentsConfig } from 'react-select';
import { Async } from 'react-select/async';

import { Layouts } from '../../../../../layouts';
import {
  AutocompleteOptionContext,
  AutocompleteOptionGroupContext,
} from '../../../Autocomplete/context';
import { IAutocompleteConfig } from '../../../Autocomplete/types';
import { ISelectOption } from '../../../types';
import * as Styles from '../../Option/styles';

export const AutocompleteOption: SelectComponentsConfig<IAutocompleteConfig, boolean>['Option'] = ({
  innerProps,
  isSelected,
  data,
  selectProps,
}) => {
  const instance: Async<ISelectOption, false> | null = selectProps.instance;
  const { template, onSelect, isOptionDisabled } = useContext(AutocompleteOptionGroupContext);

  const isDisabled = isOptionDisabled?.(data) ?? false;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      instance?.blur();
      onSelect(data);
    },
    [instance, onSelect, data],
  );

  return (
    <Styles.StyledOption
      padding="2"
      as="li"
      aria-selected={isSelected}
      disabled={isDisabled}
      borderVariant={selectProps.groupSize === 1 ? 'top' : 'none'}
      {...(innerProps as any)}
      onClick={isDisabled ? undefined : handleClick}
    >
      <Layouts.Box
        width="100%"
        as={Layouts.Flex}
        justifyContent="space-between"
        alignItems="center"
      >
        {template ? (
          <AutocompleteOptionContext.Provider value={data}>
            {template}
          </AutocompleteOptionContext.Provider>
        ) : null}
      </Layouts.Box>
    </Styles.StyledOption>
  );
};
