import { format } from 'date-fns';
import validator from 'validator';
import * as Yup from 'yup';

import { IntlConfig } from '@root/i18n/types';

import { notNullObject } from '../../../../../helpers';
import { Customer } from '../../../../../stores/entities';
import { Maybe } from '../../../../../types';
import { ICreditCard, INewCreditCard } from '../../types';

const baseCardInformationShape = (intl: IntlConfig) => ({
  addressLine1: Yup.string()
    .required('Address Line 1 is required')
    .max(100, 'Please enter up to 100 characters'),
  addressLine2: Yup.string().nullable().max(100, 'Please enter up to 100 characters'),
  city: Yup.string().required('City is required').max(50, 'Please enter up to 50 characters'),
  state: Yup.string().required('State is required').max(50, 'Please enter up to 50 characters'),
  zip: Yup.string()
    .matches(intl.zipRegexp, 'ZIP must be in correct format')
    .required('ZIP is required'),
  active: Yup.boolean().required(),
  cardNickname: Yup.string(),
});

const generateEditCardInformationSchema = (intl: IntlConfig) =>
  Yup.object().shape(baseCardInformationShape(intl));

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
  nameOnCard: Yup.string()
    .strict(true)
    .trim('Leading and trailing whitespace not allowed')
    .required('Name on Card is required'),
  expirationMonth: Yup.string().test(
    'expirationMonth',
    'Invalid Expiration Date',
    function (expirationMonth) {
      const month = +expirationMonth!;

      const now = new Date();

      now.setMonth(now.getMonth() - 1);

      return now < new Date(+`20${this.parent.expirationYear as string}`, month - 1);
    },
  ),
  expirationYear: Yup.string().required('Invalid Expiration Date'),
};

const generateCreateCardInformationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    ...baseCardInformationShape(intl),
    ...createCardInformationShape,
  });

const jobSiteAssignmentShape = {
  jobSites: Yup.array().of(Yup.number().required('Job site required')).nullable(),
};

const jobSiteAssignmentSchema = Yup.object().shape(jobSiteAssignmentShape);

export const getValidationSchema = (isNew: boolean, intl: IntlConfig) => [
  isNew ? generateCreateCardInformationSchema(intl) : generateEditCardInformationSchema(intl),
  jobSiteAssignmentSchema,
];

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
  expirationMonth: '',
  expirationYear: '',
  cardNumber: '',
  cardType: 'UNKN',
  isAutopay: false,
};

export const getValues = (item: ICreditCard | null, customer: Customer): INewCreditCard => {
  if (!item) {
    return {
      ...defaultValue,
      ...customer.billingAddress,
    };
  }

  const data = notNullObject(item, defaultValue);

  data.cvv = '•••';
  data.cardNumber = `•••• •••• •••• ${data.cardNumberLastDigits}`;
  data.expirationMonth = format(item.expDate as Date, 'MM');
  data.expirationYear = format(item.expDate as Date, 'yy');

  return data;
};
