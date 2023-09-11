import { format } from 'date-fns';
import validator from 'validator';
import * as Yup from 'yup';

import { Customer } from '@root/app/entities';
import { notNullObject } from '@root/core/helpers';
import { Maybe } from '@root/core/types';
import { ICreditCard, INewCreditCard } from '@root/core/types/entities';

const baseCardInformationShape = {
  addressLine1: Yup.string()
    .required('Address Line 1 is required')
    .max(100, 'Please enter up to 100 characters'),
  addressLine2: Yup.string().nullable().max(100, 'Please enter up to 100 characters'),
  city: Yup.string().required('City is required').max(50, 'Please enter up to 50 characters'),
  state: Yup.string().required('State is required').max(50, 'Please enter up to 50 characters'),
  zip: Yup.string().required('ZIP is required'),
  active: Yup.boolean().required(),
  cardNickname: Yup.string(),
};

const editCardInformationSchema = Yup.object().shape(baseCardInformationShape);

const createCardInformationShape = {
  cvv: Yup.string()
    .min(3, 'CVV must be at least 3 characters long')
    .max(4, 'Please enter up to 4 characters')
    .matches(/\d{3,4}/, 'Invalid CVV Type')
    .required('CVV is required'),
  cardNumber: Yup.string().test(
    'cardNumber',
    'Please enter a valid card number',
    (value?: Maybe<string>) => {
      return !!value && validator.isCreditCard(value);
    },
  ),
  nameOnCard: Yup.string().required('Name on Card is required'),
  expirationMonth: Yup.string().test('expirationMonth', 'Invalid Expiration Date', function (
    expirationMonth,
  ) {
    const month = +expirationMonth!;

    const now = new Date();

    now.setMonth(now.getMonth() - 1);

    return now < new Date(+`20${this.parent.expirationYear as string}`, month - 1);
  }),
};

const createCardInformationSchema = Yup.object().shape({
  ...baseCardInformationShape,
  ...createCardInformationShape,
});

const jobSiteAssignmentShape = {
  jobSites: Yup.array().of(Yup.number().required('Job site required')).nullable(),
};

const jobSiteAssignmentSchema = Yup.object().shape(jobSiteAssignmentShape);

export const getValidationSchema = (isNew: boolean) => [
  isNew ? createCardInformationSchema : editCardInformationSchema,
  jobSiteAssignmentSchema,
];

const today = new Date();

const defaultValue: INewCreditCard = {
  id: 0,
  active: true,
  jobSites: null,
  addressLine1: '',
  addressLine2: '',
  cardNickname: '',
  cardNumberLastDigits: '',
  city: '',
  customerId: 0,
  expDate: new Date(),
  nameOnCard: '',
  state: '',
  zip: '',
  cvv: '',
  expirationDate: '',
  expirationMonth: format(today, 'MM'),
  expirationYear: format(today, 'yy'),
  cardNumber: '',
  cardType: 'UNKN',
};

export const getValues = (item: ICreditCard | null, customer: Customer): INewCreditCard => {
  if (!item) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...defaultValue,
      ...customer?.billingAddress,
    };
  }

  const data = notNullObject(item, defaultValue);

  data.cvv = '•••';
  data.cardNumber = `•••• •••• •••• ${data.cardNumberLastDigits}`;
  data.expirationMonth = format(item.expDate, 'MM');
  data.expirationYear = format(item.expDate, 'yy');

  return data;
};
