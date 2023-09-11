import React, { memo, useCallback } from 'react';
import ReactSelect from 'react-select';

import { InputContainer } from '@root/core/common/BaseInput';

import { multiSelectComponents } from '../components';
import { filterExactOption, filterOption, formatLabel } from '../helpers';
import { useSelectOptionGroups } from '../hooks';
import { customStyles } from '../styles';
import { ISelectOption } from '../types';

import { IMultiSelect } from './types';

export const MultiSelect: React.FC<IMultiSelect> = memo(
  ({
    name,
    error,
    noErrorMessage,
    label,
    value,
    onSelectChange,
    disabled,
    exactSearch,
    className,
    searchInputValue,
    options: propsOptions,
    placeholder = '',
    nonClearable = false,
    searchable = false,
    checkbox = false,
    id = name,
  }) => {
    const [options, selectValues] = useSelectOptionGroups(propsOptions, value);

    const handleChange = useCallback(
      (options: ISelectOption[] | undefined | null) => {
        onSelectChange(name, options?.map((x) => x.value) ?? []);
      },
      [name, onSelectChange],
    );

    return (
      <InputContainer
        error={error}
        id={id}
        label={label}
        noErrorMessage={noErrorMessage}
        className={className}
      >
        <ReactSelect
          styles={customStyles}
          placeholder={placeholder}
          isClearable={!nonClearable}
          isDisable={disabled}
          isSearchable={searchable}
          filterOption={exactSearch ? filterExactOption : filterOption}
          formatOptionLabel={formatLabel}
          options={options}
          name={name}
          error={error}
          onChange={handleChange as any}
          value={selectValues}
          components={multiSelectComponents}
          inputValue={searchInputValue}
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          checkbox={checkbox}
          captureMenuScroll={false}
          isMulti
        />
      </InputContainer>
    );
  },
);
