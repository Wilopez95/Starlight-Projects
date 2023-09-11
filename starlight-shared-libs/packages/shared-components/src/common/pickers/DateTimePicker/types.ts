import { FormikErrors } from 'formik';

import { IBaseInput } from '../../../types/base';
import { TextInputElement } from '../../TextInput/types';

export interface IDateTimePicker extends IBaseInput<Date, FormikErrors<Date>> {
  format: string;
  minDate?: Date;
  maxDate?: Date;
  minTime?: Date;
  maxTime?: Date;
  defaultValue?: Date;
  use24hrFormat?: boolean;
  staticMode?: boolean;
  enableSeconds?: boolean;
  minuteIncrement?: number;
  onChange(name: string, value: Date): void;
  onKeyUp?(e: React.KeyboardEvent<TextInputElement>): void;
}
