import { isAfter } from 'date-fns';
import validator from 'validator';
import * as Yup from 'yup';

import { ONLY_NUMBERS_AND_LETTERS } from '@root/consts';
import { IntlConfig } from '@root/i18n/types';

import { NewMultiOrderPayment } from '../../../../../Payments/types';
import { FormikCustomerWithInvoiceDrafts } from '../../types';

const defaultValue = {
  paymentType: 'creditCard' as const,
  creditCardId: undefined,
  isAch: false,
  date: new Date(),
  sendReceipt: false,
};

export const generateValidationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    paymentType: Yup.string().required('Payment type is required'),
    checkNumber: Yup.string()
      .nullable()
      .when('paymentType', {
        is: 'check',
        then: Yup.string()
          .matches(ONLY_NUMBERS_AND_LETTERS, 'Please, use only numbers or letters')
          .required('Check is required'),
      }),
    creditCardId: Yup.number()
      .nullable()
      .when('paymentType', {
        is: 'creditCard',
        then: Yup.number().required('Credit card is required'),
      }),
    date: Yup.date()
      .required('Date is required')
      .when('paymentType', {
        is: 'check',
        then: Yup.date()
          .required('Date is required')
          .test('date', 'Date cannot be after today', val => {
            return !!val && !isAfter(val, new Date());
          }),
      }),
    newCreditCard: Yup.object().when(['paymentType', 'creditCardId'], {
      is: (paymentType: string, creditCardId: number) =>
        paymentType === 'creditCard' && creditCardId === 0,
      then: Yup.object()
        .shape({
          active: Yup.boolean().required(),
          cardNickname: Yup.string(),
          addressLine1: Yup.string()
            .required('Address Line 1 is required')
            .max(100, 'Please enter up to 100 characters'),
          addressLine2: Yup.string().nullable().max(100, 'Please enter up to 100 characters'),
          city: Yup.string()
            .required('City is required')
            .max(50, 'Please enter up to 50 characters'),
          state: Yup.string()
            .required('State is required')
            .max(50, 'Please enter up to 50 characters'),
          zip: Yup.string()
            .matches(intl.zipRegexp, 'ZIP must be in correct format')
            .required('Zip is required'),
          cvv: Yup.string()
            .min(3, 'CVV must be at least 3 characters long')
            .max(4, 'Please enter up to 4 characters')
            .matches(/\d{3,4}/, 'Invalid CVV Type')
            .required('CVV is required'),
          cardNumber: Yup.string().test('cardNumber', 'Please enter a valid card number', value => {
            return !!value && validator.isCreditCard(value);
          }),
          nameOnCard: Yup.string().required('Name on card is required'),
          expirationMonth: Yup.string().test(
            'expirationMonth',
            'Invalid expiration date',
            function (expirationMonth) {
              if (!expirationMonth) {
                return false;
              }

              const month = +expirationMonth;

              const now = new Date();

              now.setMonth(now.getMonth() - 1);

              return now < new Date(+`20${this.parent.expirationYear as string}`, month - 1);
            },
          ),
          expirationYear: Yup.string().required('Invalid Expiration Date'),
        })
        .required(),
    }),
  });

export const getValues = (
  currentCustomer: FormikCustomerWithInvoiceDrafts,
): NewMultiOrderPayment => {
  return {
    ...defaultValue,
    orderIds: Object.keys(currentCustomer.overlimitOrders).map(Number),
  };
};
