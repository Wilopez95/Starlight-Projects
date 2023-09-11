import { IInvoice, ManuallyCreatablePayment } from '@root/finance/types/entities';

import { IEntity } from '../entities/entity';

export interface IBillingCustomer extends IEntity {
  id: number;
  onAccount: boolean;
  name: string;
  balance: number;
  payments: ManuallyCreatablePayment[];
  invoices: IInvoice[];
}
