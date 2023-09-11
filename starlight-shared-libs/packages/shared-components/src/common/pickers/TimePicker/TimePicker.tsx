import React, { useCallback } from 'react';
import TimePickerComponent from 'react-flatpickr';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { InputContainer } from '../../BaseInput';

import type { ITimePicker } from './types';

import 'flatpickr/dist/themes/material_green.css';
import 'flatpickr/dist/flatpickr.css';
import styles from './css/styles.scss';

export const TimePicker: React.FC<ITimePicker> = ({
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
  onChange,
  onKeyUp,
  minuteIncrement = 5,
  enableSeconds = false,
  use24hrFormat = false,
  format = 'h:i:S K',
  minValue = '00:00',
  maxValue = '23:59',
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
      id={name}
      noErrorMessage={noError}
      error={error}
      label={label}
      className={cx(wrapperClassName, {
        [styles.borderError]: borderError,
      })}
    >
      <TimePickerComponent
        id={name}
        onChange={disabled ? noop : handleChange}
        onOpen={handleFocus}
        value={value}
        className={cx(className, styles.timePicker, {
          [styles.error]: error,
          [styles.disabled]: disabled,
        })}
        data-error={error}
        disabled={disabled}
        options={{
          minuteIncrement,
          enableSeconds,
          enableTime: true,
          noCalendar: true,
          minTime: minValue,
          maxTime: maxValue,
          time_24hr: use24hrFormat,
          dateFormat: format,
          disableMobile: true,
          static: staticMode,
          onKeyDown: handleKeyDown,
        }}
      />
    </InputContainer>
  );
};
