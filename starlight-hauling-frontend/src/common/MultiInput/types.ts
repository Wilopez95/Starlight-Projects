import { IBaseInput } from '@root/types';

export interface IMultiInput extends Omit<IBaseInput<string[], string | string[]>, 'value'> {
  values?: string[];
  borderless?: boolean;
  placeholder?: string;
  searchValue?: string;
  onChange(name: string, values?: string[], shouldValidate?: boolean): void;
}

export type MultiInputLocalValidationErrors = 'format' | 'quantity';
