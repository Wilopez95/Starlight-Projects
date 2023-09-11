import React, { memo, useCallback, useRef, useState } from 'react';
import ReactSelect from 'react-select';
import { useFormikContext } from 'formik';

import { InputContainer } from '../../BaseInput/InputContainer/InputContainer';
import { multiSelectComponents } from '../components';
import { filterExactOption, filterOption, formatLabel } from '../helpers';
import { useSelectOptionGroups } from '../hooks';
import { customStyles } from '../styles';
import { ISelectOption } from '../types';

import { IMultiSelect } from './types';

const minInputHeight = 38;

export const MultiSelect: React.FC<IMultiSelect> = memo(
  ({
    name,
    error,
    noErrorMessage,
    label,
    value,
    onSelectChange,
    onMenuScrollToBottom,
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
    ariaLabel,
    maxMenuHeight,
    components = {},
  }) => {
    const formikContext = useFormikContext();
    const [options, selectValues] = useSelectOptionGroups(propsOptions, value);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const [menuHeight, setMenuHeight] = useState(maxMenuHeight);

    const handleChange = useCallback(
      (options: ISelectOption[] | undefined | null) => {
        onSelectChange(name, options?.map(x => x.value) ?? []);
        if (formikContext) {
          const { setFieldError } = formikContext;

          setFieldError(name, undefined);
        }

        if (maxMenuHeight) {
          setTimeout(
            () =>
              setMenuHeight(maxMenuHeight - (inputRef.current?.clientHeight || 0) + minInputHeight),
            0,
          );
        }
      },
      [formikContext, maxMenuHeight, name, onSelectChange],
    );

    return (
      <InputContainer
        error={error}
        id={id}
        label={label}
        inputRef={inputRef}
        noErrorMessage={noErrorMessage}
        className={className}
      >
        <ReactSelect
          styles={customStyles}
          placeholder={placeholder}
          inputId={id}
          aria-label={ariaLabel}
          isClearable={!nonClearable}
          isDisabled={disabled}
          isSearchable={searchable}
          filterOption={exactSearch ? filterExactOption : filterOption}
          formatOptionLabel={formatLabel}
          options={options}
          name={name}
          error={error}
          onChange={handleChange as any}
          onMenuScrollToBottom={onMenuScrollToBottom}
          value={selectValues}
          components={{ ...multiSelectComponents, ...components }}
          inputValue={searchInputValue}
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          checkbox={checkbox}
          captureMenuScroll={!!onMenuScrollToBottom}
          maxMenuHeight={menuHeight}
          isMulti
        />
      </InputContainer>
    );
  },
);
