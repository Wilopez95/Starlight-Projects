import React, { useCallback } from 'react';
import Picker from 'react-flatpickr';
import cx from 'classnames';
import MonthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { InputContainer } from '../../BaseInput/InputContainer/InputContainer';

import type { IMonthPicker } from './types';

import 'flatpickr/dist/themes/material_green.css';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import 'flatpickr/dist/flatpickr.css';
import './css/styles.scss';
import inputStyles from './css/input.scss';

export const MonthPicker: React.FC<IMonthPicker> = ({
  name,
  format,
  className,
  disabled,
  label,
  wrapperClassName,
  borderError,
  value,
  noError,
  error,
  staticMode,
  defaultValue,
  placeholder,
  minValue,
  maxValue,
  onChange,
  onKeyUp,
}) => {
  const formikContext = useFormikContext();

  const handleChange = useCallback(
    (selectedDates: Date[]) => {
      if (value || !defaultValue) {
        onChange(name, selectedDates[0]);
      } else if (defaultValue) {
        onChange(name, defaultValue);
      }
    },
    [defaultValue, name, onChange, value],
  );

  const handleFocus = useCallback(() => {
    if (formikContext) {
      const { setFieldError } = formikContext;

      setFieldError(name, undefined);
    }
  }, [formikContext, name]);

  const handleKeyDown = useCallback(
    (...props) => {
      const event = props[3];

      onKeyUp?.(event);
    },
    [onKeyUp],
  );

  return (
    <InputContainer
      noErrorMessage={noError}
      error={error}
      label={label}
      className={cx(wrapperClassName, {
        [inputStyles.borderError]: borderError,
      })}
    >
      <Picker
        id={name}
        placeholder={placeholder}
        onChange={disabled ? noop : handleChange}
        onOpen={handleFocus}
        value={value}
        className={cx(className, inputStyles.monthPicker, {
          [inputStyles.error]: error,
          [inputStyles.disabled]: disabled,
        })}
        data-error={error}
        disabled={disabled}
        options={{
          plugins: [
            new MonthSelectPlugin({
              shorthand: true,
            }),
          ],
          minDate: minValue,
          maxDate: maxValue,
          dateFormat: format,
          disableMobile: true,
          altInput: true,
          altFormat: 'F, Y',
          static: staticMode,
          onKeyDown: handleKeyDown,
        }}
      />
    </InputContainer>
  );
};
