import { TFunction } from 'i18next';
import { isEqual } from 'lodash-es';
import * as Yup from 'yup';

import { notNullObject } from '@root/core/helpers';
import { IRegionConfig } from '@root/core/i18n/types';
import { Maybe } from '@root/core/types';
import { mainPhoneNumber } from '@root/customer/components/PhoneNumber/defaults';
import { IEditCustomerData } from '@root/customer/forms/EditCustomer/types';
import { ICustomer } from '@root/customer/types';

const I18N_PATH = 'modules.customer.forms.EditCustomer.Validation.';

export const customerInfoShape = (regionConfig: IRegionConfig, t: TFunction) => {
  const SHAPE_I18N_PATH = `${I18N_PATH}CustomerInfoShape.`;

  return {
    email: Yup.string()
      .trim()
      .email(t(`${SHAPE_I18N_PATH}Email.format`)),
    phoneNumbers: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        number: Yup.string()
          .ensure()
          .test('mobile', t(`${SHAPE_I18N_PATH}PhoneNumbers.format`), (value?: Maybe<string>) => {
            return !!value && regionConfig.validatePhoneNumber(value);
          }),
        extension: Yup.string()
          .matches(/^[0-9]{4}$/, t(`${SHAPE_I18N_PATH}PhoneNumbers.extension`))
          .nullable(),
      }),
    ),
  };
};

export const generalInformationCommercialShape = (t: TFunction) => {
  const SHAPE_I18N_PATH = `${I18N_PATH}GeneralInformationCommercialShape.`;

  return {
    businessName: Yup.string()
      .trim()
      .required(t(`${SHAPE_I18N_PATH}BusinessName.required`))
      .max(100, t(`${SHAPE_I18N_PATH}BusinessName.max`)),
  };
};

export const generalInformationNonCommercialShape = (t: TFunction) => {
  const SHAPE_I18N_PATH = `${I18N_PATH}GeneralInformationNonCommercialShape.`;

  return {
    firstName: Yup.string()
      .trim()
      .required(t(`${SHAPE_I18N_PATH}FirstName.required`))
      .max(50, t(`${SHAPE_I18N_PATH}FirstName.max`)),
    lastName: Yup.string()
      .required(t(`${SHAPE_I18N_PATH}LastName.required`))
      .max(50, t(`${SHAPE_I18N_PATH}LastName.max`)),
  };
};

export const addressTabShape = (t: TFunction) => {
  const SHAPE_I18N_PATH = `${I18N_PATH}AddressTabShape.`;

  return {
    searchString: Yup.string(),
    mailingAddress: Yup.object()
      .shape({
        addressLine1: Yup.string()
          .required(t(`${SHAPE_I18N_PATH}AddressLine1.required`))
          .max(100, t(`${SHAPE_I18N_PATH}AddressLine1.required`)),
        addressLine2: Yup.string()
          .nullable()
          .max(100, t(`${SHAPE_I18N_PATH}AddressLine1.required`)),
        city: Yup.string()
          .required(t(`${SHAPE_I18N_PATH}City.required`))
          .max(50, t(`${SHAPE_I18N_PATH}City.max`)),
        state: Yup.string()
          .required(t(`${SHAPE_I18N_PATH}State.required`))
          .max(50, t(`${SHAPE_I18N_PATH}State.max`)),
        zip: Yup.string().required(t(`${SHAPE_I18N_PATH}Zip.required`)),
      })
      .required(),
    billingAddress: Yup.object().shape({
      billingAddressSameAsMailing: Yup.boolean(),
      addressLine1: Yup.string().when('billingAddressSameAsMailing', {
        is: false,
        then: Yup.string()
          .required(t(`${SHAPE_I18N_PATH}AddressLine1.required`))
          .max(100, t(`${SHAPE_I18N_PATH}AddressLine1.required`)),
      }),
      addressLine2: Yup.string()
        .nullable()
        .max(100, t(`${SHAPE_I18N_PATH}AddressLine1.required`)),
      city: Yup.string().when('billingAddressSameAsMailing', {
        is: false,
        then: Yup.string()
          .required(t(`${SHAPE_I18N_PATH}City.required`))
          .max(50, t(`${SHAPE_I18N_PATH}City.max`)),
      }),
      state: Yup.string().when('billingAddressSameAsMailing', {
        is: false,
        then: Yup.string()
          .required(t(`${SHAPE_I18N_PATH}State.required`))
          .max(50, t(`${SHAPE_I18N_PATH}State.max`)),
      }),
      zip: Yup.string().when('billingAddressSameAsMailing', {
        is: false,
        then: Yup.string().required(t(`${SHAPE_I18N_PATH}Zip.required`)),
      }),
    }),
  };
};

const defaultValue: IEditCustomerData = {
  id: 0,
  commercial: true,
  searchString: '',
  balance: 0,
  businessName: '',
  businessUnitId: 0,
  salesId: undefined,
  financeCharge: null,
  customerGroupId: 1,
  signatureRequired: false,
  poRequired: true,
  firstName: '',
  lastName: '',
  alternateId: '',
  ownerId: undefined,
  email: '',
  phoneNumbers: [mainPhoneNumber],
  mainEmail: '',
  mainFirstName: '',
  mainLastName: '',
  mainJobTitle: null,
  mainPhoneNumbers: [mainPhoneNumber],
  invoiceConstruction: 'byAddress',
  onAccount: false,
  creditLimit: undefined,
  billingCycle: 'daily',
  paymentTerms: 'cod',
  aprType: 'standard',
  addFinanceCharges: true,
  mailingAddress: {
    id: 0,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  },
  billingAddress: {
    id: 0,
    billingAddressSameAsMailing: true,
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
  },
  generalNote: '',
  popupNote: '',
  contactId: undefined,
  sendInvoicesByEmail: true,
  sendInvoicesByPost: false,
  attachTicketPref: false,
  attachMediaPref: false,
  invoiceEmails: [],
  statementEmails: [],
  notificationEmails: [],
  mainCustomerPortalUser: false,
  customerPortalUser: false,
};

export const getValues = (item?: IEditCustomerData | ICustomer): IEditCustomerData => {
  if (!item) {
    return defaultValue;
  }
  const billingAddressSameAsMailing = isEqual(item.mailingAddress, item.billingAddress);
  const billingAddress = { ...item.billingAddress, billingAddressSameAsMailing };

  return notNullObject({ ...item, billingAddress }, defaultValue);
};
