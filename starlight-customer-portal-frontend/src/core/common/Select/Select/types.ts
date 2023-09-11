import { IBaseSelect, SelectValue } from '../types';

export interface ISelect extends IBaseSelect {
  value?: SelectValue;
  onSelectChange(name: string, value: SelectValue): void;
}
