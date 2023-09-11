import { ICheckbox } from '@starlightpro/shared-components';
import type currency from 'currency.js';
import { IAppliedInvoice, IInvoice } from '@root/modules/billing/types';

export interface IInvoiceRow {
  fieldName: string;
  disabled: boolean;
  invoice: IAppliedInvoice | IInvoice;
  value: boolean;
  newBalance: number | currency;
  businessUnitId: string;
  isEditable?: boolean;
  isPrepay?: boolean;
  isWriteOff?: boolean;
  onChange?: ICheckbox['onChange'];
}
