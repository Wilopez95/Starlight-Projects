import React, { memo, useCallback } from 'react';
import ReactSelect from 'react-select';
import { useFormikContext } from 'formik';

import { InputContainer } from '../../BaseInput/InputContainer/InputContainer';
import { singleSelectComponents } from '../components';
import { filterExactOption, filterOption, formatLabel } from '../helpers';
import { useSelectOptionGroups } from '../hooks';
import { customStyles } from '../styles';
import { ISelectOption } from '../types';

import { ISelect } from './types';

export const Select: React.FC<ISelect> = memo(
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
    options: propsMotions,
    ariaLabel,
    placeholder = '',
    nonClearable = false,
    searchable = false,
    id = name,
    noOptionsMessage,
    components = {},
    menuPortalTarget = null,
  }) => {
    const formikContext = useFormikContext();
    const [options, selectValues] = useSelectOptionGroups(propsMotions, value);

    const handleChange = useCallback(
      (maybeOption?: ISelectOption | null) => {
        onSelectChange(name, maybeOption?.value ?? '');
        if (formikContext) {
          const { setFieldError } = formikContext;

          setFieldError(name, undefined);
        }
      },
      [formikContext, name, onSelectChange],
    );

    // this is necessary for update placeholder for select while value is undefined.
    const currentValue = selectValues[0] ?? null;

    return (
      <InputContainer
        error={error}
        id={id}
        label={label}
        noErrorMessage={noErrorMessage}
        className={className}
        disabled={disabled}
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
          menuPortalTarget={menuPortalTarget}
          options={options}
          name={name}
          error={error}
          onChange={handleChange as any}
          value={currentValue}
          components={{ ...singleSelectComponents, ...components }}
          hideSelectedOptions={false}
          inputValue={searchInputValue}
          captureMenuScroll={false}
          noOptionsMessage={noOptionsMessage ? () => noOptionsMessage : undefined}
        />
      </InputContainer>
    );
  },
);
