import { ISelectOption, SelectValue } from '@starlightpro/shared-components';

import { IBaseInput } from '@root/types';

export interface IMultiSelect extends Omit<IBaseInput<SelectValue[]>, 'value'> {
  options: ISelectOption[];
  defaultValues?: SelectValue[];
  values?: SelectValue[];
  borderless?: boolean;
  placeholder?: string;
  footer?: React.ReactNode;
  searchable?: boolean;
  searchValue?: string;
  onSelectChange(name: string, values?: SelectValue[]): void;
  onFooterSelect?(): void;
}
