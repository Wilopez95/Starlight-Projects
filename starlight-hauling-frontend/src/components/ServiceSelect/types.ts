import { ISelect } from '@starlightpro/shared-components';

export interface IServiceSelect extends Omit<ISelect, 'options'> {
  oneTime?: boolean;
  businessLineId?: number;
}
