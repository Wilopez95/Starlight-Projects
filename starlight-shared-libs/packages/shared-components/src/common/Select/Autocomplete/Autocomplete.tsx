import React, { memo, useCallback, useRef } from 'react';
import AsyncReactSelect from 'react-select/async';
import { useDebouncedCallback } from 'use-debounce';

import { InputContainer } from '../../BaseInput/InputContainer/InputContainer';
import { autocompleteComponents, multiSelectComponents } from '../components/selectComponentsProp';
import { customStyles } from '../styles';
import { ISelectOption } from '../types';

import { containerSizeToMenuHeight, validateOptions } from './helpers';
import { IAutocomplete, IAutocompleteOptionGroupData } from './types';

export const Autocomplete: React.FC<IAutocomplete> = memo(
  ({
    name,
    error,
    label,
    disabled,
    className,
    configs,
    onSearchChange,
    onRequest,
    onClear,
    size,
    background,
    noErrorMessage,
    selectedValue,
    minSearchLength = 3,
    search = '',
    placeholder = '',
    nonClearable = false,
    id = name,
    ariaLabel,
    isMulti = false,
    value,
    onChange,
  }) => {
    const autocompleteInstance = useRef<AsyncReactSelect<ISelectOption, false>>(null);
    const handleInputChange = useCallback(
      (newValue: string) => {
        onSearchChange(name, newValue);
      },
      [name, onSearchChange],
    );

    const handleLoad = useCallback(
      async (
        searchString: string,
        callback: (newOptions: IAutocompleteOptionGroupData[]) => void,
      ) => {
        if (searchString.length < minSearchLength) {
          return callback([]);
        }

        try {
          const response = await onRequest(searchString);

          if (!response) {
            return callback([]);
          }

          let autocompleteOptionGroups: (IAutocompleteOptionGroupData | null)[] = [];

          if (Array.isArray(response)) {
            const currentConfig = configs[0];

            autocompleteOptionGroups = [
              {
                options: validateOptions(response, !!currentConfig.footer),
                ...currentConfig,
              },
            ];
          } else {
            autocompleteOptionGroups = Object.entries(
              response,
            ).map<IAutocompleteOptionGroupData | null>(([key, options]) => {
              const maybeConfig = configs.find(x => x.name === key);

              if (!maybeConfig) {
                return null;
              }

              return {
                options: validateOptions(options, !!maybeConfig.footer),
                ...maybeConfig,
              };
            });
          }

          return callback(
            autocompleteOptionGroups.filter(Boolean) as IAutocompleteOptionGroupData[],
          );
        } catch (error) {
          console.error('Autocomplete error:', error);

          return callback([]);
        }
      },
      [configs, minSearchLength, onRequest],
    );

    const [handleDebounceLoad] = useDebouncedCallback(handleLoad, 400);

    return (
      <InputContainer
        error={error}
        id={id}
        label={label}
        noErrorMessage={noErrorMessage}
        className={className}
        size={size}
      >
        <AsyncReactSelect
          styles={customStyles}
          placeholder={placeholder}
          aria-label={ariaLabel}
          inputId={id}
          isClearable={!nonClearable}
          isDisabled={disabled}
          name={name}
          error={error}
          hideSelectedOptions={false}
          inputValue={selectedValue ? selectedValue : search}
          onInputChange={handleInputChange}
          loadOptions={handleDebounceLoad}
          captureMenuScroll={false}
          components={{ ...autocompleteComponents, ...(isMulti ? multiSelectComponents : {}) }}
          ref={autocompleteInstance}
          instance={autocompleteInstance.current}
          minSearchLength={minSearchLength}
          maxMenuHeight={containerSizeToMenuHeight(size)}
          size={size}
          background={background}
          selectedValue={selectedValue}
          value={value}
          onClear={onClear}
          menuIsOpen={selectedValue ? false : undefined}
          groupSize={configs.length}
          isMulti={isMulti}
          onChange={onChange}
        />
      </InputContainer>
    );
  },
);
