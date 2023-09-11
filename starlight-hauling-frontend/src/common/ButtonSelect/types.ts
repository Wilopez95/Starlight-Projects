import { IBaseButton, ISelectOption } from '@starlightpro/shared-components';

import { IBaseInput } from '@root/types/base';

export interface IButtonSelectItem {
  name: string;
  value: string;
  label?: string;
}

export interface IButtonSelect extends IBaseButton<IButtonSelectItem>, IBaseInput<string | number> {
  items: ISelectOption[];
  direction?: 'row' | 'column';
  onSelectionChange(path: string, value?: string | number): void;
}
