import { type ICustomer, type IEntity, type Maybe } from '../../../types';
import { type ICreditCard, type INewCreditCard } from '../CreditCards/types';
import { Payment } from '../Payments/store/Payment';
import {
  InvoicedStatus,
  ManuallyCreatablePayment,
  PaymentStatus,
  PaymentType,
} from '../Payments/types';

export interface IPayout extends IEntity {
  date: Date;
  paymentType: PaymentType;
  amount: number;
  prevBalance: number;
  payments: ManuallyCreatablePayment[];
  isAch: boolean;
  status: PaymentStatus;
  invoicedStatus: InvoicedStatus;
  sendReceipt: boolean;
  appliedAmount: number;
  customer: ICustomer;
  creditCard: Maybe<ICreditCard>;
  checkNumber?: string;
  newBalance?: number;
  unappliedAmount?: number;
  isPrepay?: boolean;
  isEditable?: boolean;
}

type BaseNewPayout = Omit<IPayout, keyof IEntity | 'status' | 'creditCard' | 'customer'> & {
  selectedPayments: Payment[];
};

export type CheckPayout = BaseNewPayout & {
  paymentType: 'check';
  checkNumber: string;
  isAch: boolean;
};

export type CreditCardPayout = BaseNewPayout & {
  paymentType: 'creditCard';
  creditCardId?: number;
  newCreditCard?: INewCreditCard;
};

export type CashPayout = BaseNewPayout & {
  paymentType: 'cash';
};

export type CreditMemoPayout = BaseNewPayout & {
  paymentType: 'creditMemo';
};

export type WriteOffPayout = BaseNewPayout & {
  paymentType: 'writeOff';
};

export type NewPayout =
  | CheckPayout
  | CreditCardPayout
  | CashPayout
  | CreditMemoPayout
  | WriteOffPayout;
