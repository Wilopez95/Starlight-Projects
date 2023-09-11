import { ICheckbox } from '@starlightpro/shared-components';

import { ManuallyCreatablePayment } from '../../../../../Payments/types';

export interface IPaymentRow {
  payment: ManuallyCreatablePayment;
  disabled: boolean;
  checked: boolean;
  onChange?: ICheckbox['onChange'];
}
