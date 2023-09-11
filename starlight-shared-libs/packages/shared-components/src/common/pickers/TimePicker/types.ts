import { FormikErrors } from 'formik';

import { IBaseInput } from '../../../types/base';
import { TextInputElement } from '../../TextInput/types';

export interface ITimePicker extends IBaseInput<Date, FormikErrors<Date>> {
  format?: string;
  minValue?: Date;
  maxValue?: Date;
  defaultValue?: Date;
  use24hrFormat?: boolean;
  staticMode?: boolean;
  enableSeconds?: boolean;
  minuteIncrement?: number;
  onChange(name: string, value: Date): void;
  onKeyUp?(e: React.KeyboardEvent<TextInputElement>): void;
}
