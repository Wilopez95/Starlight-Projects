import { ISelect } from '@starlightpro/shared-components';

export interface IThirdPartyHaulerSelect extends Omit<ISelect, 'options'> {
  activeOnly?: boolean;
}
