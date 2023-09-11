import { type INewCreditCard } from '../../CreditCards/types';
import { type PaymentType } from '../../Payments/types';

export type CreatePayoutPayload = {
  paymentIds: number[];
  date: string;
  paymentType: PaymentType;
  amount: number;
  creditCardId?: number;
  newCreditCard?: INewCreditCard;
  checkNumber?: number;
  isAch?: boolean;
};
