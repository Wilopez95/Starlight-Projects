import { IBaseSelect, SelectValue } from '../types';

export interface IMultiSelect extends IBaseSelect {
  value: SelectValue[];
  checkbox?: boolean;
  onSelectChange(name: string, value: SelectValue[]): void;
}
