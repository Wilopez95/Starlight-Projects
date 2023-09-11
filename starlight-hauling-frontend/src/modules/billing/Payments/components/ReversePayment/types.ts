import { ReverseType } from '../../types';

export interface IReversePaymentData {
  paymentDate: Date;
  paymentAmount: number;
  reversalDate: Date;
  reversalType: ReverseType;
  comment: string;
}
