import { ICustomInput } from '../CustomInput/types';

export interface ISwitch extends Omit<ICustomInput, 'checked' | 'onChange'> {
  children: React.ReactNode;
  labelClass?: string;
  value?: boolean;
  small?: boolean;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
}
