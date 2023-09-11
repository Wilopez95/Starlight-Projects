import * as Yup from 'yup';

import { emailValidator, notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import { Maybe } from '@root/types';

import { IContactFormData } from './types';

export const validationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .required('First Name is required')
      .max(50, 'Please enter up to 50 characters'),
    lastName: Yup.string()
      .trim()
      .required('Last Name is required')
      .max(50, 'Please enter up to 50 characters'),
    jobTitle: Yup.string().nullable(),
    email: Yup.string().trim().email(emailValidator).nullable().required('Email is required'),
    phoneNumbers: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        number: Yup.string()
          .ensure()
          .test('mobile', 'Please enter a valid phone number', (value?: Maybe<string>) => {
            return !!value && intl.validatePhoneNumber(value);
          }),
        extension: Yup.string()
          .matches(/^[0-9]*$/, 'Please enter a valid extension')
          .nullable(),
      }),
    ),
  });

const defaultValue: IContactFormData = {
  id: 0,
  customerId: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  firstName: '',
  lastName: '',
  email: null,
  jobTitle: null,
  allowContractorApp: false,
  allowCustomerPortal: false,
  customerPortalUser: false,
  temporaryContact: false,
  phoneNumbers: [],
};

export const getValues = (item?: IContactFormData): IContactFormData => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
