import { BillableItemType } from '@root/core/consts';
import { ICreditCard, IEntity, INewCreditCard, Maybe } from '@root/core/types';
import { ICustomer } from '@root/customer/types';
import { Invoice } from '@root/finance/stores/invoice/Invoice';
import { IAppliedInvoice } from '@root/finance/types/entities/invoice';
import { IOrder } from '@root/finance/types/entities/order';

export type RefundType = 'CHECK' | 'CREDIT_CARD' | 'ON_ACCOUNT';
export type PaymentType = 'cash' | 'check' | 'creditCard' | 'creditMemo' | 'writeOff';
export type PaymentStatus = 'failed' | 'authorized' | 'captured' | 'deferred';
export type InvoicedStatus = 'applied' | 'unapplied' | 'reversed';
export type PaymentMethod = 'cash' | 'check' | 'creditCard' | 'onAccount';

export type ManuallyCreatablePayment = IEntity & {
  status: PaymentStatus;
  invoicedStatus: InvoicedStatus;
  isAch: boolean;
  date: Date;
  paymentType: PaymentType;
  amount: number;
  sendReceipt: boolean;
  creditCard: Maybe<ICreditCard>;
  customer: ICustomer;
  writeOffNote?: string;
  memoNote?: string;
  billableItem?: string;
  billableItemId?: number;
  billableItemType?: BillableItemType;
  checkNumber?: string;
  prevBalance?: number;
  newBalance?: number;
  appliedAmount?: number;
  unappliedAmount?: number;
  invoices?: IAppliedInvoice[];
  reverseData?: ReverseData;
  refundedAmount?: number;
  refundedOnAccountAmount?: number;
  originalPaymentId?: string;
  orders?: IOrder[];
  deferredUntil?: Date;
  creditCardId?: number;
};

export type GeneralPayment = ManuallyCreatablePayment & {
  paymentType: PaymentType | 'refundOnAccount';
};

type BaseNewPayment = Omit<
  ManuallyCreatablePayment,
  keyof IEntity | 'status' | 'creditCard' | 'customer' | 'amount'
>;

export type CheckPayment = BaseNewPayment & {
  paymentType: 'check';
  checkNumber: string;
  isAch: boolean;
};

export type CreditCardPayment = BaseNewPayment & {
  paymentType: 'creditCard';
  creditCardId?: number;
  newCreditCard?: Maybe<INewCreditCard>;
};

export type CashPayment = BaseNewPayment & {
  paymentType: 'cash';
};

export type CreditMemoPayment = BaseNewPayment & {
  paymentType: 'creditMemo';
};

export type WriteOffPayment = BaseNewPayment & {
  paymentType: 'writeOff';
};

type UnappliedPayment<T> = T & {
  applications: PaymentApplication[];
  amount?: number;
};

export type MultiOrderPayment<T> = Omit<
  T,
  'invoicedStatus' | 'amount' | 'memoNote' | 'appliedAmount' | 'unappliedAmount' | 'writeOffNote'
> & {
  orderIds: number[];
  creditCardId?: number;
  newCreditCard?: INewCreditCard;
};

export type NewPayment =
  | CheckPayment
  | CreditCardPayment
  | CashPayment
  | CreditMemoPayment
  | WriteOffPayment;

export type NewUnappliedPayment = UnappliedPayment<NewPayment>;

export type PaymentAmount = {
  balance: number;
};

export type NewMultiOrderPayment = MultiOrderPayment<NewPayment>;

export type PaymentApplication = {
  invoiceId: number;
  amount: number;
};

export type ReverseData = {
  date: Date;
  note: string;
  type: string;
  amount: number;
};

export enum ReverseType {
  cash = 'counterfeitCash',
  check = 'bounced',
  creditCard = 'chargeback',
  other = 'other',
}

export type RefundPrepaidOrderPayment = {
  refundedPaymentId: number;
  refundType: RefundType;
  orderId: number;
  amount: number;
  checkNumber?: string;
};

export type GetPaymentValuesParams = {
  balance: number;
  payment?: GeneralPayment | null;
  invoices?: Invoice[] | null;
};

export type WriteOffParams = {
  invoiceIds: number[];
  customerId: number;
  note: string;
};
