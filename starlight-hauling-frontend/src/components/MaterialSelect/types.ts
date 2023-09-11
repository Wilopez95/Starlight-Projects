import { ISelect } from '@starlightpro/shared-components';

export interface IMaterialSelect extends Omit<ISelect, 'options' | 'onSelectChange'> {
  businessLineId?: number;
}
