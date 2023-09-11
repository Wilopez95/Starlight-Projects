import * as Yup from 'yup';

import { notNullObject, priceValidator } from '../../../../../helpers';
import { ManuallyCreatablePayment } from '../../types';

import { IRefundUnappliedPaymentData } from './types';

export const getValidationSchema = (unappliedAmount: number) => {
  return Yup.object().shape({
    refundAmount: Yup.number()
      .typeError('Refund amount must be a number')
      .positive('Refund amount must be greater than zero')
      .test(
        'refundAmount',
        'You have enter incorrect refund amount. Please enter in valid format (e.g. 100 or 100.99)',
        priceValidator,
      )
      .max(unappliedAmount, 'Refund amount cannot be more than unapplied amount'),
  });
};

const defaultValue: IRefundUnappliedPaymentData = {
  refundDate: new Date(),
  refundAmount: 0,
  refundType: '',
  creditCardId: undefined,
};

export const getValues = (
  payment: ManuallyCreatablePayment | null,
): IRefundUnappliedPaymentData => {
  const item: Partial<IRefundUnappliedPaymentData> = {
    refundDate: new Date(),
    refundAmount: payment?.unappliedAmount,
    refundType: 'creditCard',
    creditCardId: payment?.creditCard?.id,
  };

  return notNullObject(item, defaultValue);
};
