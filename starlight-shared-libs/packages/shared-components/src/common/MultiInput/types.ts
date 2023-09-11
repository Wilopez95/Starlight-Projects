import { IBaseInput } from '../../types/base';

export interface IMultiInput extends Omit<IBaseInput<string[]>, 'value'> {
  values?: string[];
  borderless?: boolean;
  placeholder?: string;
  searchValue?: string;
  entity?: string;
  validationRule(entity: string): boolean;
  onChange(name: string, values?: string[]): void;
}
