import React, { useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { capitalize, isEmpty, trim, xor } from 'lodash-es';

import { Layouts } from '../../layouts';
import { FormInput } from '../FormInput/FormInput';
import { Typography } from '../Typography/Typography';

import { IMultiInput } from './types';

import styles from './css/styles.scss';

const maxLength = 5;

export const MultiInput: React.FC<IMultiInput> = ({
  className,
  name,
  placeholder,
  borderless,
  error,
  noError,
  wrapperClassName,
  disabled: propsDisabled,
  label,
  searchValue,
  entity,
  validationRule,
  onChange,
  values = [],
  id = name,
}) => {
  const formikContext = useFormikContext();

  const [search, setSearch] = useState(searchValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;

      const parsed = value.split(new RegExp(/,|;/));

      const entities = new Set([...parsed]);
      const validEntities = [...entities].filter(entity => validationRule(entity));
      let newSearch = value;

      const valuesLength = values.length;
      const validEntitiesLength = validEntities.length;
      const count = maxLength > valuesLength ? maxLength - valuesLength : 0;

      if (validEntitiesLength > 0) {
        const limitedEntities = validEntities.slice(0, count);

        onChange(name, [...values, ...limitedEntities]);

        newSearch = trim(value.replace(new RegExp(limitedEntities.join('(;|,)|'), 'gi'), ''), ',;');
      }

      setSearch(newSearch);
      if (formikContext) {
        if (validEntitiesLength > count) {
          formikContext.setFieldError(
            name,
            newSearch
              ? `${
                  entity ? ` ${capitalize(entity)}` : ''
                } quantity should not be greater than ${maxLength}`
              : '',
          );
        } else {
          formikContext.setFieldError(
            name,
            newSearch ? `Wrong${entity ? ` ${entity}` : ''} format` : '',
          );
        }
      }
    },
    [entity, formikContext, name, onChange, validationRule, values],
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleContainerClick = useCallback(() => {
    if (formikContext) {
      const { setFieldError } = formikContext;

      setFieldError(name, undefined);

      inputRef.current?.focus();
    }
  }, [formikContext, name]);

  const handleClear = useCallback(
    (e: React.MouseEvent, items: string[]) => {
      e.stopPropagation();
      onChange(name, xor(values, items));
    },
    [onChange, name, values],
  );

  return (
    <div className={cx(styles.wrapper, wrapperClassName)}>
      {label ? (
        <Layouts.Margin top="0.5" bottom="0.5">
          <Typography
            color="secondary"
            as="label"
            shade="desaturated"
            variant="bodyMedium"
            htmlFor={id}
          >
            {label}
          </Typography>
        </Layouts.Margin>
      ) : null}
      <div className={cx(styles.container, className)} onClick={handleContainerClick}>
        <FormInput
          name={name}
          className={cx(styles.input, { [styles.fullWidth]: !values.length })}
          disabled={propsDisabled}
          wrapClassName={cx(styles.control, {
            [styles.error]: error,
            [styles.borderless]: borderless,
            [styles.disabled]: propsDisabled,
            [styles.placeholder]: !search,
          })}
          onChange={handleSearch}
          onBlur={handleBlur}
          autoComplete="off"
          value={search}
          placeholder={isEmpty(values) ? placeholder : undefined}
          noError
          reverse
        >
          {values.map(option => (
            <span key={`${name}-${option}`} className={styles.multiLabel}>
              {option}
              <span
                className={cx(styles.icon, styles.cross)}
                onClick={e => handleClear(e, [option])}
              >
                ✕
              </span>
            </span>
          ))}
          <div className={styles.controls}>
            <span className={cx(styles.icon, styles.cross)} onClick={e => handleClear(e, values)}>
              ✕
            </span>
          </div>
        </FormInput>
      </div>
      {!noError ? (
        <div data-error={error} className={styles.validationText} role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
};
