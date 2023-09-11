import { IModal } from '@root/common/Modal/types';

export interface IRefundWrongCCModal extends IModal {
  creditCardLabel: string;
  amount: number;
  orderId: number;
  paymentId: number;
  customerId: number;
}
