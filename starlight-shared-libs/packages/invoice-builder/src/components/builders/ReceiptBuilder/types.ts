import type { CreditCardType, IOrder } from '../../../types';
import type { IBuilder } from '../types';

export type PaymentMethod = 'creditCard' | 'check' | 'cash';

export type OrderPayment =
  | {
      paymentIdentifier: string;
      paymentMethod: 'check';
      amount: number;
      date: Date;
    }
  | {
      paymentMethod: 'cash';
      amount: number;
      date: Date;
    }
  | {
      paymentIdentifier: string;
      paymentMethod: 'creditCard';
      amount: number;
      date: Date;
      cardType: CreditCardType | string;
      paymentRetRef?: string;
    };

export interface IReceiptBuilder extends Omit<IBuilder, 'orders'> {
  order: IOrder;
  payment: OrderPayment;
}
