import { omit } from 'lodash-es';
import * as Yup from 'yup';

import { type CompanyInformationRequest } from '@root/api';
import {
  addressValidationSchema,
  getAddressesFormValues,
  mailingAddressValidationSchema,
} from '@root/components/ConfigurationAddresses/formikData';
import { emailValidator, notNullObject } from '@root/helpers';
import { Units } from '@root/i18n/config/units';
import { IntlConfig } from '@root/i18n/types';
import { type ICompany, type Maybe } from '@root/types';

import { type FormikCompanyInformation } from './types';

export const validationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    officialEmail: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .email(emailValidator)
      .nullable(),
    officialWebsite: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .url('Wrong website format')
      .nullable(),
    phone: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .required('Phone is required')
      .ensure()
      .test('mobile', 'Please enter a valid phone number', (value?: Maybe<string>) => {
        return !!value && intl.validatePhoneNumber(value);
      }),
    fax: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .notRequired()
      .nullable()
      .ensure()
      .test('fax', 'Please enter a valid fax', value =>
        value ? intl.validatePhoneNumber(value) : true,
      ),
    physicalAddress: addressValidationSchema(intl),
    mailingAddress: mailingAddressValidationSchema(intl),
  });

const defaultValue: FormikCompanyInformation = {
  phone: '',
  fax: '',
  facilityAddress: '',
  officialEmail: '',
  officialWebsite: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  tenantId: 1,
  timeZoneName: 'America/New_York',
  clockIn: false,
  id: 0,
  unit: Units.us,
  ...getAddressesFormValues(),
};

export const getFormValues = (item?: ICompany | null): FormikCompanyInformation => {
  if (!item) {
    return defaultValue;
  }

  return {
    ...notNullObject(item, defaultValue),
    ...getAddressesFormValues(item),
  };
};

export const getEntityValues = ({
  mailingAddress,
  ...formValues
}: FormikCompanyInformation): CompanyInformationRequest => ({
  ...formValues,
  mailingAddress: mailingAddress.sameAsPhysical
    ? formValues.physicalAddress
    : omit(mailingAddress, 'sameAsPhysical'),
});
