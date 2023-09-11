import * as Yup from 'yup';

import { notNullObject } from '@root/core/helpers';
import { IRegionConfig } from '@root/core/i18n/types';
import { Maybe } from '@root/core/types';

import { IContactFormData } from './types';

export const validationSchema = (regionConfig: IRegionConfig) =>
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
    email: Yup.string().trim().email('Wrong email format').nullable(),
    phoneNumbers: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        number: Yup.string()
          .ensure()
          .test('mobile', 'Please enter a valid phone number', (value?: Maybe<string>) => {
            return !!value && regionConfig.validatePhoneNumber(value);
          }),
        extension: Yup.string()
          .matches(/^[0-9]{4}$/, 'Please enter a valid extension')
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
  main: false,
};

export const getValues = (item?: IContactFormData | null): IContactFormData => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
