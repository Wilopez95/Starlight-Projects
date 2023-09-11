import i18next from 'i18next';
import * as Yup from 'yup';

import { IContactFormData } from '@root/components/forms/NewContact/types';
import { mainPhoneNumber } from '@root/components/PhoneNumber/defaults';
import { emailValidator, notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import { IContact, Maybe } from '@root/types';

export const validationSchema = (intl: IntlConfig, i18nPath: string) =>
  Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .required(i18next.t(`${i18nPath}FirstNameRequired`))
      .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
    lastName: Yup.string()
      .trim()
      .required(i18next.t(`${i18nPath}LastNameRequired`))
      .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
    jobTitle: Yup.string().nullable(),
    email: Yup.string()
      .trim()
      .email(emailValidator)
      .nullable()
      .when('allowCustomerPortal', {
        is: true,
        then: Yup.string().required(
          i18next.t(`ValidationErrors.IsRequired`, { fieldName: i18next.t(`Text.Email`) }),
        ),
      })
      .when('allowContractorApp', {
        is: true,
        then: Yup.string().required(
          i18next.t(`ValidationErrors.IsRequired`, { fieldName: i18next.t(`Text.Email`) }),
        ),
      }),
    phoneNumbers: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        number: Yup.string()
          .ensure()
          .test(
            'mobile',
            i18next.t(`ValidationErrors.ValidPhoneNumber`),
            (value?: Maybe<string>) => {
              return !!value && intl.validatePhoneNumber(value);
            },
          ),
        extension: Yup.string()
          .matches(/^[0-9]*$/, i18next.t(`ValidationErrors.ValidExtension`))
          .nullable(),
      }),
    ),
  });

const defaultValue: IContactFormData = {
  id: 0,
  customerId: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  firstName: '',
  lastName: '',
  jobTitle: null,
  email: null,
  allowContractorApp: false,
  allowCustomerPortal: false,
  customerPortalUser: false,
  temporaryContact: false,
  phoneNumbers: [],
  main: false,
};

export const getValues = (item: IContact | null): IContact => {
  if (!item) {
    return defaultValue;
  }

  if (item.main && !item.phoneNumbers?.length) {
    item.phoneNumbers = [mainPhoneNumber];
  }

  return notNullObject(item, defaultValue);
};
