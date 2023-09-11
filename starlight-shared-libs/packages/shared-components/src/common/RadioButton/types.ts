import { ICustomInput } from '../CustomInput/types';

export interface IRadioButton extends Omit<ICustomInput, 'checked'> {
  children?: React.ReactNode;
  labelClass?: string;
  value?: boolean;
}
