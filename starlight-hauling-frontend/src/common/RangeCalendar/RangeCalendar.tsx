import React, { useCallback } from 'react';
import { Modifier, Modifiers } from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import defaults from 'react-day-picker/lib/src/classNames';
import { Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { useFormikContext } from 'formik';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../Typography/Typography';

import { formatValue, parseDate } from './helpers';
import { IRangeCalendar } from './types';

import inputStyles from './css/input.scss';
import styles from './css/styles.scss';

export const RangeCalendar: React.FC<IRangeCalendar> = ({
  classNames,
  wrapperClassName,
  error,
  placeholder,
  minDate,
  maxDate,
  label,
  name,
  noError,
  calendarProps,
  readOnly = true,
  id = name,
}) => {
  const formikContext = useFormikContext();
  const { dateFormat } = useIntl();
  const intl = useIntl();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { onDayClick, onDayMouseEnter, state } = calendarProps;
  const { enteredTo, from, to } = state;

  const handleFocus = useCallback(() => {
    if (formikContext) {
      const { setFieldError } = formikContext;

      setFieldError(name, undefined);
    }
  }, [formikContext, name]);

  // TODO do not use classes bundled with day picker
  const classes = { ...defaults, ...styles, ...classNames };

  const disabledDays = maxDate || minDate ? { before: minDate, after: maxDate } : undefined;

  const modifiers = { start: from, end: enteredTo };
  const selectedDays = [from, { from, to: enteredTo }];

  return (
    <div className={cx(inputStyles.wrap, wrapperClassName, 'range')}>
      {label ? (
        <Typography color="secondary" as="label" shade="desaturated" htmlFor={id}>
          {label}
        </Typography>
      ) : null}
      <DayPickerInput
        classNames={inputStyles}
        inputProps={{
          name,
          id,
          readOnly,
          'data-error': error ?? undefined,
          onFocus: handleFocus,
        }}
        format={dateFormat.date}
        placeholder={placeholder}
        parseDate={parseDate}
        hideOnDayClick={false}
        value={formatValue(from, to, intl)}
        dayPickerProps={{
          disabledDays: disabledDays as Modifier,
          classNames: classes,
          selectedDays: selectedDays as Modifier[],
          modifiers: modifiers as Partial<Modifiers>,
          onDayMouseEnter,
          onDayClick,
          enableOutsideDaysClick: false,
        }}
      />

      {noError === false ? <Layouts.ValidationError>{error}</Layouts.ValidationError> : null}
    </div>
  );
};
