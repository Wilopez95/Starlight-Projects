import React, { useCallback } from 'react';
import Picker from 'react-flatpickr';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { InputContainer } from '../../BaseInput/InputContainer/InputContainer';

import type { IDateTimePicker } from './types';

import 'flatpickr/dist/themes/material_green.css';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import 'flatpickr/dist/flatpickr.css';
import './css/styles.scss';
import inputStyles from './css/input.scss';

export const DateTimePicker: React.FC<IDateTimePicker> = ({
  name,
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
  format,
  minDate,
  maxDate,
  minTime,
  maxTime,
  onChange,
  onKeyUp,
  minuteIncrement = 5,
  enableSeconds = false,
  use24hrFormat = false,
}) => {
  const formikContext = useFormikContext();

  const handleChange = useCallback(
    (newValue: Date[] | Date) => {
      if (value || !defaultValue) {
        onChange(name, Array.isArray(newValue) ? newValue[0] : newValue);
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
        onChange={disabled ? noop : handleChange}
        onOpen={handleFocus}
        value={value}
        className={cx(className, inputStyles.dateTimePicker, {
          [inputStyles.error]: error,
          [inputStyles.disabled]: disabled,
        })}
        data-error={error}
        disabled={disabled}
        options={{
          minuteIncrement,
          enableSeconds,
          enableTime: true,
          minTime,
          maxTime,
          minDate,
          maxDate,
          time_24hr: use24hrFormat,
          dateFormat: format,
          altInput: true,
          altFormat: 'M j, Y h:i K',
          disableMobile: true,
          static: staticMode,
          monthSelectorType: 'static',
          onKeyDown: handleKeyDown,
        }}
      />
    </InputContainer>
  );
};
