import { ICustomInput } from '../CustomInput/types';

export interface ICheckbox extends Omit<ICustomInput, 'checked'> {
  labelClass?: string;
  value?: boolean;
  indeterminate?: boolean;
}
