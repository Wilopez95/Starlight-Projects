import React, { useCallback, useState } from 'react';
import { InputContainer } from '@starlightpro/shared-components';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { isEmpty, isEqual, trim, uniq, xor } from 'lodash-es';

import { FormInput } from '../FormInput/FormInput';
import { Tooltip } from '../Tooltip';

import { IMultiInput } from './types';

import styles from './css/styles.scss';

export const MultiInput: React.FC<IMultiInput> = ({
  className,
  ariaLabel,
  name,
  placeholder,
  borderless,
  error,
  noError,
  wrapperClassName,
  disabled: propsDisabled,
  label,
  searchValue,
  onChange,
  values = [],
  id = name,
}) => {
  const formikContext = useFormikContext();

  const [search, setSearch] = useState(searchValue);

  const handleSubmitInput = useCallback(() => {
    const value = search;

    if (!value) {
      return;
    }

    const newInputValues = value.split(/[,;]/).filter(Boolean).map(trim);

    if (newInputValues.length === 1 && values.includes(value)) {
      setSearch('');

      return;
    }

    const newValue = uniq([...values, ...newInputValues]);

    onChange(name, newValue, true);
    setSearch('');
  }, [name, onChange, search, values]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        handleSubmitInput();
      }
    },
    [handleSubmitInput],
  );

  const handleContainerClick = useCallback(() => {
    if (formikContext) {
      const { setFieldError } = formikContext;

      setFieldError(name, undefined);
    }
  }, [formikContext, name]);

  const handleClear = useCallback(
    (e: React.MouseEvent, items: string[]) => {
      e.stopPropagation();

      if (isEqual(items, values)) {
        onChange(name, [], true);

        return;
      }

      onChange(name, xor(values, items), true);
    },
    [onChange, name, values],
  );

  let inputError: string | undefined;

  if (error) {
    inputError = typeof error === 'string' ? error : error.filter(Boolean)[0];
  }

  return (
    <InputContainer
      label={label}
      id={id}
      error={inputError}
      noErrorMessage={noError}
      className={wrapperClassName}
    >
      <div className={cx(styles.container, className)} onClick={handleContainerClick}>
        <FormInput
          name={name}
          ariaLabel={ariaLabel}
          className={cx(styles.input, styles.search, { [styles.fullWidth]: !values.length })}
          disabled={propsDisabled}
          wrapClassName={cx(styles.control, {
            [styles.error]: inputError,
            [styles.borderless]: borderless,
            [styles.disabled]: propsDisabled,
            [styles.placeholder]: !search,
          })}
          onChange={handleSearch}
          onBlur={handleSubmitInput}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          value={search}
          placeholder={isEmpty(values) ? placeholder : undefined}
          noError
          reverse
        >
          {values.map((option, index) => {
            const optionErrors = Array.isArray(error) ? error : [];

            const currentError = optionErrors[index];

            const optionElement = (
              <span className={cx(styles.multiLabel, { [styles.error]: !!currentError })}>
                {option}
                <span
                  className={cx(styles.icon, styles.cross)}
                  onClick={e => handleClear(e, [option])}
                >
                  ✕
                </span>
              </span>
            );

            if (currentError) {
              return (
                <Tooltip key={`${name}-${option}`} position="top" text={currentError}>
                  {optionElement}
                </Tooltip>
              );
            }

            return <React.Fragment key={`${name}-${option}`}>{optionElement}</React.Fragment>;
          })}
          <div className={styles.controls}>
            <span className={cx(styles.icon, styles.cross)} onClick={e => handleClear(e, values)}>
              ✕
            </span>
          </div>
        </FormInput>
      </div>
    </InputContainer>
  );
};
