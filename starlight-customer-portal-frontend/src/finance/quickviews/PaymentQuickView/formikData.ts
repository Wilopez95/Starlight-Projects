import { TFunction } from 'i18next';
import validator from 'validator';
import * as Yup from 'yup';

import type {
  GetPaymentValuesParams,
  NewUnappliedPayment,
} from '@root/finance/types/entities/payment';

const I18N_PATH = 'Errors.Payment.';
const defaultValue: NewUnappliedPayment = {
  isAch: false,
  invoicedStatus: 'unapplied',
  paymentType: 'creditCard',
  amount: 0,
  date: new Date(),
  sendReceipt: false,
  prevBalance: 0,
  newBalance: 0,
  appliedAmount: 0,
  unappliedAmount: 0,
  applications: [],
  invoices: [],
  memoNote: '',
  writeOffNote: '',
  checkNumber: '',
  reverseData: undefined,
  refundedAmount: 0,
  refundedOnAccountAmount: 0,
  originalPaymentId: undefined,
};

export const validationSchema = (t: TFunction) =>
  Yup.object().shape({
    amount: Yup.number()
      .typeError(t(`${I18N_PATH}AmountMustBeNumeric`))
      .positive(t(`${I18N_PATH}AmountMustBePositive`))
      .required(t(`${I18N_PATH}AmountIsRequired`)),
    creditCardId: Yup.number()
      .nullable()
      .when('paymentType', {
        is: 'creditCard',
        then: Yup.number().required(t(`${I18N_PATH}CreditCardIsRequired`)),
      }),
    newCreditCard: Yup.object().when(['paymentType', 'creditCardId'], {
      is: (paymentType: string, creditCardId: number) =>
        paymentType === 'creditCard' && creditCardId === 0,
      then: Yup.object()
        .shape({
          active: Yup.boolean().required(),
          cardNickname: Yup.string(),
          addressLine1: Yup.string()
            .required(t(`${I18N_PATH}AdressLine`))
            .max(100, t(`${I18N_PATH}MaxChars100`)),
          addressLine2: Yup.string()
            .nullable()
            .max(100, t(`${I18N_PATH}MaxChars100`)),
          city: Yup.string()
            .required(t(`${I18N_PATH}CityReq`))
            .max(50, t(`${I18N_PATH}MaxChars50`)),
          state: Yup.string()
            .required(t(`${I18N_PATH}StateReq`))
            .max(50, t(`${I18N_PATH}MaxChars50`)),
          zip: Yup.string().required(t(`${I18N_PATH}ZipReq`)),
          cvv: Yup.string()
            .min(3, t(`${I18N_PATH}CvvLength`))
            .max(4, t(`${I18N_PATH}CVV`))
            .matches(/\d{3,4}/, t(`${I18N_PATH}InvalidCvv`))
            .required(t(`${I18N_PATH}CvvReq`)),
          cardNumber: Yup.string().test('cardNumber', t(`${I18N_PATH}ValidCard`), (value) => {
            return !!value && validator.isCreditCard(value);
          }),
          nameOnCard: Yup.string().required(t(`${I18N_PATH}NameReq`)),
          expirationMonth: Yup.string().test(
            'expirationMonth',
            t(`${I18N_PATH}InvalidMonth`),
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
        })
        .required(),
    }),
  });

export const getValues = ({ balance, invoices }: GetPaymentValuesParams): NewUnappliedPayment => {
  defaultValue.prevBalance = balance;

  return {
    ...defaultValue,
    amount: invoices?.reduce((acc, invoice) => acc + invoice.balance ?? 0, 0),
    applications: invoices
      ? invoices.map((invoice) => ({ amount: invoice.balance ?? 0, invoiceId: invoice?.id }))
      : [],
  };
};
