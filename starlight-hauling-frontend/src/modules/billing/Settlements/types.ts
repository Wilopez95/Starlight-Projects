import { type IEntity, type Maybe, type PaymentGateway } from '../../../types';
import { type ManuallyCreatablePayment } from '../Payments/types';

export interface ISettlement extends IEntity {
  date: Date;
  paymentGateway: PaymentGateway;
  fees: number;
  amount: number;
  adjustments: number;
  count: number;
  mid: string;
  settlementTransactions?: ISettlementTransaction[];
  pdfUrl?: string;
}

export interface ISettlementTransaction extends IEntity {
  amount: number;
  fee: number;
  adjustment: number;
  transactionNote: Maybe<string>;
  payment: Maybe<ManuallyCreatablePayment>;
}
