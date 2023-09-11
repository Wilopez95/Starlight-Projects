import { IInvoice, ManuallyCreatablePayment } from '@root/modules/billing/types';

import { IEntity } from '../entities/entity';

export interface IBillingCustomer extends IEntity {
  id: number;
  onAccount: boolean;
  name: string;
  balance: number;
  payments: ManuallyCreatablePayment[];
  invoices: IInvoice[];
}
