export interface IRefundUnappliedPaymentData {
  refundAmount: number;
  refundDate: Date;
  refundType: string;
  creditCardId?: number;
}
