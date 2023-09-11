import { IBaseInput } from '../../types/base';
import { IBaseButton } from '../Button/types';

type Option<L = string, V = string | number> = {
  label: L;
  value: V;
  hint?: L;
};

export interface IButtonSelectItem {
  name: string;
  value: string;
  label?: string;
}

export interface IButtonSelect extends IBaseButton<IButtonSelectItem>, IBaseInput<string | number> {
  items: Option[];
  direction?: 'row' | 'column';
  onSelectionChange(path: string, value?: string | number): void;
}
