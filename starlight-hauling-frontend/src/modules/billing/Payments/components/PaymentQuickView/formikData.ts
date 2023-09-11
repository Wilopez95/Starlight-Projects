import { isAfter } from 'date-fns';
import i18next from 'i18next';
import validator from 'validator';
import * as Yup from 'yup';

import { ONLY_NUMBERS_AND_LETTERS } from '@root/consts';
import { notNullObject, priceValidator } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';

import {
  type GetPaymentValuesParams,
  type NewUnappliedPayment,
  type PaymentType,
} from '../../types';

const defaultValue: NewUnappliedPayment = {
  isAch: false,
  invoicedStatus: 'unapplied',
  paymentType: 'cash',
  amount: undefined,
  date: new Date(),
  sendReceipt: false,
  prevBalance: 0,
  newBalance: 0,
  appliedAmount: 0,
  unappliedAmount: 0,
  invoices: [],
  notAppliedInvoices: [],
  memoNote: '',
  writeOffNote: '',
  checkNumber: '',
  reverseData: undefined,
  refundedAmount: 0,
  refundedOnAccountAmount: 0,
  originalPaymentId: undefined,
};

export const generateValidationSchema = (intl: IntlConfig) => {
  return Yup.object().shape({
    notAppliedInvoices: Yup.array().of(
      Yup.object().shape({
        amount: Yup.number()
          .nullable()
          .when('checked', {
            is: true,
            then: Yup.number()
              .nullable()
              .typeError('Amount must be numeric')
              .positive('Amount must be positive')
              .test('amount', i18next.t('ValidationErrors.IncorrectAmountFormat'), priceValidator)
              .test('moreThan', i18next.t('ValidationErrors.IncorrectAmountFormat'), priceValidator)
              .required('Amount is required'),
          }),
      }),
    ),
    amount: Yup.number()
      .typeError('Amount must be numeric')
      .positive('Amount must be positive')
      .test('amount', i18next.t('ValidationErrors.IncorrectAmountFormat'), priceValidator)
      .required('Amount is required'),
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
          .test('date', 'Date cannot be more than today', val => {
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
          nameOnCard: Yup.string().required('Name on Card is required'),
          expirationMonth: Yup.string().test(
            'expirationMonth',
            'Invalid Expiration Date',
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
    memoNote: Yup.string().nullable().max(256, 'Please enter up to 256 characters'),
    writeOffNote: Yup.string().when('paymentType', {
      is: 'writeOff',
      then: Yup.string().required('Write off note is required'),
    }),
  });
};

export const getValues = ({
  balance,
  payment,
  isMemo,
  isWriteOff,
  invoice,
  notAppliedInvoices,
}: GetPaymentValuesParams): NewUnappliedPayment => {
  defaultValue.prevBalance = balance;

  if (!payment) {
    let paymentType: PaymentType;

    if (isWriteOff) {
      paymentType = 'writeOff';
    } else if (isMemo) {
      paymentType = 'creditMemo';
    } else {
      paymentType = defaultValue.paymentType;
    }

    if (
      invoice &&
      !isWriteOff &&
      (invoice.status === 'open' || invoice.status === 'overdue') &&
      invoice.balance > 0
    ) {
      const notAppliedInvoice = notAppliedInvoices.find(
        notAppliedInvoiceData => invoice.id.toString() === notAppliedInvoiceData.id.toString(),
      );

      if (notAppliedInvoice) {
        notAppliedInvoice.checked = true;
        notAppliedInvoice.amount = invoice.balance;
      }

      return {
        ...defaultValue,
        paymentType,
        amount: invoice.balance,
        notAppliedInvoices,
      };
    }

    return {
      ...defaultValue,
      paymentType,
      notAppliedInvoices,
    };
  }

  const newValues = notNullObject<NewUnappliedPayment>(payment, {
    ...defaultValue,
    notAppliedInvoices: notAppliedInvoices.filter(
      notAppliedInvoice =>
        !(payment.invoices ?? []).some(
          invoiceData => Number(invoiceData.id) === Number(notAppliedInvoice.id),
        ),
    ),
  });

  const { billableItemId, billableItemType, creditCard, checkNumber, isAch } = payment;

  if (isMemo) {
    newValues.paymentType = 'creditMemo';
    newValues.billableItem =
      billableItemId && billableItemType ? `${billableItemType}_${billableItemId}` : undefined;
  } else if (newValues.paymentType === 'creditCard' && creditCard) {
    newValues.checkNumber = checkNumber;
    newValues.isAch = isAch;
  }

  if (newValues.paymentType === 'creditCard' && creditCard) {
    newValues.creditCardId = +creditCard.id;
  }

  return newValues;
};
