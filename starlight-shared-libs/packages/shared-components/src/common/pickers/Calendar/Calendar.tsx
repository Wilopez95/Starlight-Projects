import React, { useCallback, useRef, useState } from 'react';
import DayPicker, { Modifier } from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import defaults from 'react-day-picker/lib/src/classNames';
import cx from 'classnames';
import { format, startOfDay } from 'date-fns';
import { useFormikContext } from 'formik';

import { Layouts } from '../../../layouts';
import { Typography } from '../../Typography/Typography';

import { parseCalendarDate } from './helpers';
import { ICalendar } from './types';

import 'react-day-picker/lib/style.css';
import inputStyles from './css/input.scss';
import styles from './css/styles.scss';

export const Calendar: React.FC<ICalendar> = ({
  dateFormat,
  value,
  withInput,
  classNames,
  placeholder,
  readOnly,
  error,
  minDate,
  maxDate,
  label,
  name,
  firstDayOfWeek,
  onDateChange,
  onKeyUp,
  id = name,
}) => {
  const [positionX, setPositionX] = useState<'left' | 'right'>('left');
  const [positionY, setPositionY] = useState<'up' | 'down'>('down');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const formikContext = useFormikContext();
  const tabEventCount = useRef<number>(0);
  const inputInstance = useRef<DayPickerInput>(null);
  const dayPickerInstance = useRef<DayPicker>(null);
  const [isCalendarDirty, setIsCalendarDirty] = useState(false);

  const [calendarDefaultValue] = useState<any>(value);

  let shiftedValue: Date | undefined = undefined;

  if (value) {
    shiftedValue = isCalendarDirty ? value : new Date(value);
  }
  const handleChange = useCallback(
    (value: Date | null) => {
      if (!isCalendarDirty) {
        setIsCalendarDirty(true);
      }
      const normalizedValue = value ? startOfDay(value) : null;
      onDateChange(name, normalizedValue);
    },
    [isCalendarDirty, name, onDateChange, setIsCalendarDirty],
  );

  const handleFocus = useCallback(() => {
    if (wrapperRef.current) {
      const { x, y, width } = wrapperRef.current.getBoundingClientRect();
      const { innerWidth } = window;
      const parentModal = document.getElementsByClassName('ReactModal__Content');

      if (parentModal.length) {
        const parent = parentModal[0].getBoundingClientRect();

        setPositionX(x + 300 < parent.x + parent.width ? 'left' : 'right');
        setPositionY(y + 314 < parent.y + parent.height ? 'down' : 'up');
      } else {
        const offset = innerWidth - (x + width);

        setPositionX(offset > 300 ? 'left' : 'right');
      }
    }
    if (formikContext) {
      const { setFieldError } = formikContext;

      setFieldError(name, undefined);
    }
  }, [formikContext, name]);

  // TODO do not use classes bundled with day picker
  const classes = { ...defaults, ...styles, ...classNames };

  const disabledDays = maxDate || minDate ? { before: minDate, after: maxDate } : undefined;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { nativeEvent } = e;

      if (nativeEvent.code === 'Tab' || nativeEvent.code === 'ArrowDown') {
        e.preventDefault();

        setTimeout(() => {
          inputInstance.current?.showDayPicker();
          const dayPicker = withInput
            ? inputInstance.current?.getDayPicker().dayPicker
            : dayPickerInstance.current?.dayPicker;

          (dayPicker?.childNodes[0] as HTMLElement).focus();
        }, 0);
      }
    },
    [withInput],
  );

  const handleDayPickerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.nativeEvent.code === 'Tab') {
      if (tabEventCount.current === 3) {
        inputInstance.current?.hideDayPicker();

        tabEventCount.current = 0;

        return;
      }

      tabEventCount.current += 1;
    }
  }, []);

  return (
    <div
      className={cx(inputStyles.wrap, {
        [inputStyles.right]: positionX === 'right',
        [inputStyles.up]: positionY === 'up',
      })}
      ref={wrapperRef}
    >
      {withInput ? (
        <>
          {label ? (
            <Layouts.Margin top="0.5" bottom="0.5">
              <Typography
                color="secondary"
                variant="bodyMedium"
                as="label"
                shade="desaturated"
                htmlFor={id}
              >
                {label}
              </Typography>
            </Layouts.Margin>
          ) : null}
          <DayPickerInput
            classNames={inputStyles}
            inputProps={{
              name,
              id,
              readOnly,
              disabled: readOnly,
              'data-error': error || undefined,
              autoComplete: 'off',
              onFocus: handleFocus,
              onKeyUp,
              onKeyDown: handleKeyDown,
            }}
            ref={inputInstance}
            keepFocus={false}
            format={dateFormat}
            placeholder={placeholder}
            formatDate={(v, f) => format(v, f)}
            parseDate={parseCalendarDate}
            hideOnDayClick
            onDayChange={readOnly ? undefined : handleChange}
            value={calendarDefaultValue}
            dayPickerProps={{
              firstDayOfWeek,
              disabledDays: disabledDays as Modifier,
              classNames: classes,
              selectedDays: shiftedValue,
              month: shiftedValue,
              onKeyDown: handleDayPickerKeyDown,
            }}
          />
        </>
      ) : (
        <DayPicker
          containerProps={{ id }}
          classNames={classes}
          disabledDays={disabledDays as Modifier}
          selectedDays={shiftedValue}
          month={shiftedValue}
          firstDayOfWeek={firstDayOfWeek}
          onDayClick={handleChange}
          ref={dayPickerInstance}
        />
      )}
      <div className={styles.errorMessage}>{error}</div>
    </div>
  );
};
