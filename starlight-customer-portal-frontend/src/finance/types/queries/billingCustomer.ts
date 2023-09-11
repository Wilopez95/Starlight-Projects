import { IEntity } from '@root/core/types';

import { IInvoice } from '../entities/invoice';
import { ManuallyCreatablePayment } from '../entities/payment';

export interface IBillingCustomer extends IEntity {
  id: number;
  onAccount: boolean;
  name: string;
  balance: number;
  payments: ManuallyCreatablePayment[];
  invoices: IInvoice[];
}
