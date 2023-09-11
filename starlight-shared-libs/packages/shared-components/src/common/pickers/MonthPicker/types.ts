import { FormikErrors } from 'formik';

import { IBaseInput } from '../../../types/base';
import { TextInputElement } from '../../TextInput/types';

export interface IMonthPicker extends IBaseInput<Date, FormikErrors<Date>> {
  format: string;
  minValue?: Date;
  maxValue?: Date;
  defaultValue?: Date;
  staticMode?: boolean;
  placeholder?: string;
  onChange(name: string, value: Date): void;
  onKeyUp?(e: React.KeyboardEvent<TextInputElement>): void;
}
