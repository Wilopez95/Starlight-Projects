import { isAfter, isBefore, startOfDay } from 'date-fns';
import * as Yup from 'yup';

import { notNullObject } from '../../../../../helpers';
import { Maybe } from '../../../../../types';
import { ManuallyCreatablePayment, ReverseType } from '../../types';

import { IReversePaymentData } from './types';

export const validationSchema = Yup.object().shape({
  paymentAmount: Yup.number(),
  reversalDate: Yup.date()
    .required('Reversal Date is required')
    .test(
      'reverseDate',
      'Reversal Date cannot be more than the current date',
      (date?: Maybe<Date>) => {
        return !!date && !isAfter(startOfDay(date), startOfDay(new Date()));
      },
    )
    .test(
      'reverseDate',
      'Reversal Date cannot be less than the payment date',
      function (date?: Maybe<Date>) {
        return !!date && !isBefore(startOfDay(date), startOfDay(this.parent.paymentDate as Date));
      },
    ),
  comment: Yup.string().nullable().trim().max(256, 'Please enter up to 256 characters'),
});

const defaultValue: IReversePaymentData = {
  paymentDate: new Date(),
  paymentAmount: 0,
  reversalDate: new Date(),
  reversalType: ReverseType.other,
  comment: '',
};

export const getValues = (payment: ManuallyCreatablePayment | null): IReversePaymentData => {
  const item: Partial<IReversePaymentData> = {
    paymentDate: payment?.date,
    paymentAmount: payment?.amount,
    reversalDate: new Date(),
  };

  return notNullObject(item, defaultValue);
};
