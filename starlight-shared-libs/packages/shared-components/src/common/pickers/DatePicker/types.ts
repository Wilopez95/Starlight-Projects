import { FormikErrors } from 'formik';

import { IBaseInput } from '../../../types/base';
import { TextInputElement } from '../../TextInput/types';

export interface IDatePicker extends IBaseInput<Date, FormikErrors<Date>> {
  format: string;
  minValue?: string;
  maxValue?: string;
  defaultValue?: Date;
  staticMode?: boolean;
  onChange(name: string, value: Date): void;
  onKeyUp?(e: React.KeyboardEvent<TextInputElement>): void;
}
