import { isEqual, omit } from 'lodash-es';
import * as Yup from 'yup';

import { DEFAULT_ADDRESS } from '@root/consts/address';
import { notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';

import { IAddressesFormData } from './types';

export const getAddressesFormValues = (item?: IAddressesFormData | null): IAddressesFormData => {
  if (!item) {
    return {
      physicalAddress: DEFAULT_ADDRESS,
      mailingAddress: {
        ...DEFAULT_ADDRESS,
        sameAsPhysical: true,
      },
    };
  }

  return {
    physicalAddress: notNullObject(item.physicalAddress, DEFAULT_ADDRESS),
    mailingAddress: {
      ...notNullObject(item.mailingAddress, DEFAULT_ADDRESS),
      sameAsPhysical: isEqual(omit(item.mailingAddress, 'sameAsPhysical'), item.physicalAddress),
    },
  };
};

export const addressValidationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    addressLine1: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .required('Address Line 1 is required')
      .max(100, 'Please enter up to 100 characters'),
    addressLine2: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .nullable()
      .max(100, 'Please enter up to 100 characters'),
    city: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .required('City is required')
      .max(50, 'Please enter up to 50 characters'),
    state: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .required('State is required')
      .max(50, 'Please enter up to 50 characters'),
    zip: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .matches(intl.zipRegexp, 'ZIP must be in correct format')
      .required('ZIP is required'),
  });

export const mailingAddressValidationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    sameAsPhysical: Yup.boolean(),
    addressLine1: Yup.string()
      .strict(true)
      .when('sameAsPhysical', {
        is: false,
        then: Yup.string()
          .trim('Leading and trailing whitespace not allowed')
          .required('Address Line 1 is required')
          .max(100, 'Please enter up to 100 characters'),
      }),
    addressLine2: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .nullable()
      .max(100, 'Please enter up to 100 characters'),
    city: Yup.string()
      .strict(true)
      .when('sameAsPhysical', {
        is: false,
        then: Yup.string()
          .trim('Leading and trailing whitespace not allowed')
          .required('City is required')
          .max(50, 'Please enter up to 50 characters'),
      }),
    state: Yup.string()
      .strict(true)
      .when('sameAsPhysical', {
        is: false,
        then: Yup.string()
          .trim('Leading and trailing whitespace not allowed')
          .required('State is required')
          .max(50, 'Please enter up to 50 characters'),
      }),
    zip: Yup.string()
      .strict(true)
      .when('sameAsPhysical', {
        is: false,
        then: Yup.string()
          .trim('Leading and trailing whitespace not allowed')
          .matches(intl.zipRegexp, 'ZIP must be in correct format')
          .required('ZIP is required'),
      }),
  });
