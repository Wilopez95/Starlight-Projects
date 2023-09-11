import { ISelect } from '@starlightpro/shared-components';

export interface IContactSelect extends Omit<ISelect, 'options'> {
  customerId?: number;
  activeOnly?: boolean;
}
