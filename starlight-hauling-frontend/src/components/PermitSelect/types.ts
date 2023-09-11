import { ISelect } from '@starlightpro/shared-components';

export interface IPermitSelect extends Omit<ISelect, 'options'> {
  businessUnitId?: number;
  businessLineId?: number;
}
