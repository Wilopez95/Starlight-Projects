import { ITextInput } from '@starlightpro/shared-components';

export interface IPriceField extends Omit<ITextInput, 'onChange'> {
  value?: number;
}
