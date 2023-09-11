import React, { memo, useCallback } from 'react';
import ReactSelect from 'react-select';
import { useFormikContext } from 'formik';

import { InputContainer } from '@root/core/common/BaseInput';
import { getCleanedErrors } from '@root/core/helpers';

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
    placeholder = '',
    nonClearable = false,
    searchable = false,
    id = name,
    ariaLabel,
  }) => {
    const formikContext = useFormikContext();
    const [options, selectValues] = useSelectOptionGroups(propsMotions, value);

    const handleChange = useCallback(
      (maybeOption: ISelectOption | undefined | null) => {
        onSelectChange(name, maybeOption?.value ?? '');
        if (formikContext) {
          const { errors, setErrors } = formikContext;

          setErrors(getCleanedErrors(errors, name));
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
          value={currentValue}
          components={singleSelectComponents}
          hideSelectedOptions={false}
          inputValue={searchInputValue}
          captureMenuScroll={false}
        />
      </InputContainer>
    );
  },
);
