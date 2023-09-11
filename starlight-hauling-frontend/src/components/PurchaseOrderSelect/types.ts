import { ISelect, ISelectOption, SelectValue } from '@starlightpro/shared-components';

import { IPurchaseOrder } from '@root/types';

export interface IPurchaseOrderSelect
  extends Omit<ISelect, 'options' | 'value' | 'onSelectChange'> {
  options: ISelectOption[];
  onCreatePurchaseOrder(values: IPurchaseOrder): void;
  onSelectChange(name: string, value: SelectValue | SelectValue[]): void;
  value: SelectValue | SelectValue[];
  isMulti?: boolean;
  fullSizeModal?: boolean;
}
