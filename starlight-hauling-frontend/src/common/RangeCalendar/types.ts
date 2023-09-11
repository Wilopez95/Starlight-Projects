import { RangeModifier } from 'react-day-picker';
import { FormikErrors } from 'formik';

import { IBaseInput } from '@root/types';

export interface IRangeCalendar extends IBaseInput<RangeModifier, FormikErrors<RangeModifier>> {
  calendarProps: IRangeCalendarProps;
  wrapperClassName?: string;
  withInput?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  classNames?: {
    [key: string]: string;
  };
}

export interface IRangeCalendarValue {
  from: Date | null;
  to: Date | null;
}

export interface IRangeCalendarState extends IRangeCalendarValue {
  enteredTo: Date | null;
}

export type UseRangeCalendarResponse = (
  initialValue: IRangeCalendarValue,
) => [IRangeCalendarValue, IRangeCalendarProps];

export interface IRangeCalendarProps {
  state: IRangeCalendarState;
  onDayMouseEnter(day: Date): void;
  onDayClick(day: Date): void;
}
