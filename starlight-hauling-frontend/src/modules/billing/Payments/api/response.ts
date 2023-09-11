import { Maybe } from '../../../../types';
import { ManuallyCreatablePayment } from '../types';

export type CustomerPaymentsResponse = {
  payments: ManuallyCreatablePayment[];
};

export type CustomerDeferredPaymentsResponse = {
  deferredPayments: ManuallyCreatablePayment[];
};

export type UnconfirmedPaymentsResponse = {
  unconfirmedPayments: ManuallyCreatablePayment[];
};

export type CustomerPaymentResponse = {
  payment: Maybe<ManuallyCreatablePayment>;
};

export type LatestOrderPayment = {
  prepaidPayment: Maybe<ManuallyCreatablePayment>;
};

export type CustomerApplyPaymentResponse = {
  applyPayment: Maybe<ManuallyCreatablePayment>;
};

export type CustomerReversePaymentResponse = {
  reversePayment: Maybe<ManuallyCreatablePayment>;
};

export type CustomerRefundPaymentResponse = {
  refundUnappliedPayment: Maybe<ManuallyCreatablePayment>;
};

export type CustomerUnappliedPaymentResponse = {
  createUnappliedPayment: ManuallyCreatablePayment;
};

export type CustomerEditedCreditMemoResponse = {
  editCreditMemo: ManuallyCreatablePayment;
};

export type CustomerDeletedCreditMemoResponse = {
  deleteCreditMemo: boolean;
};

export type CustomerMultiOrderPaymentResponse = {
  newMultiOrderPayment: ManuallyCreatablePayment;
};
