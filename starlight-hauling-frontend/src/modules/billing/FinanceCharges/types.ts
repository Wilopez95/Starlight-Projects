import { type IEntity, type Maybe } from '../../../types';
import { type IBillingCustomer } from '../../../types/queries';
import { IInvoice, IInvoiceEmail } from '../Invoices/types';
import { ManuallyCreatablePayment } from '../Payments/types';
import { IStatement } from '../Statements/types';

export interface IFinanceCharge extends IEntity {
  total: number;
  balance: number;
  customer: Maybe<IBillingCustomer>;
  pdfUrl: Maybe<string>;
  writeOff: boolean;

  statement?: IStatement;
  invoices?: IInvoice[];
  payments?: ManuallyCreatablePayment[];
  emails?: IInvoiceEmail[];
}

export type FinanceChargeStatus = 'open' | 'closed';

export interface IFinanceChargeDraftData {
  customerId: number;
  businessUnitId: number;
  financeChargeApr: number;
  financeChargeInvoices: IFinanceChargeDraftInvoiceData[];
}

interface IFinanceChargeDraftInvoiceData {
  statementId: number;
  invoiceId: number;
  fine: number;
}
