import { FormikErrors } from 'formik';

import { IBaseInput } from '../../../types/base';
import { TextInputElement } from '../../TextInput/types';

export interface ICalendar extends IBaseInput<Date | null, FormikErrors<Date>> {
  dateFormat: string;
  withInput?: boolean;
  firstDayOfWeek?: number;
  minDate?: Date;
  maxDate?: Date;
  classNames?: {
    [key: string]: string;
  };
  placeholder?: string;
  onDateChange(name: string, date: Date | null): void;
  formatDate?(date: Date, format: string, locale: string): string;
  onKeyUp?(e: React.KeyboardEvent<TextInputElement>): void;
}
