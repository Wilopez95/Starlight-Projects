import i18next from 'i18next';
import { isEqual } from 'lodash-es';
import * as Yup from 'yup';

import { mainPhoneNumber } from '@root/components/PhoneNumber/defaults';
import { DEFAULT_ADDRESS } from '@root/consts/address';
import { aprTypeOptions, CustomerStatus } from '@root/consts/customer';
import { emailValidator, notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import { ICustomer, Maybe } from '@root/types';

import { INewCustomerData } from './types';

const I18N_PATH = 'components.forms.NewCustomer.ValidationErrors.';

export const generalInformationCommercialTabShape = (intl: IntlConfig) => ({
  customerGroupId: Yup.number().required(i18next.t(`${I18N_PATH}CustomerGroupIsRequired`)),
  businessName: Yup.string()
    .trim()
    .required(i18next.t(`${I18N_PATH}BusinessNameIsRequired`))
    .max(100, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 100 })),
  email: Yup.string().trim().email(emailValidator).nullable(),
  alternateId: Yup.string().nullable(),
  phoneNumbers: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      number: Yup.string()
        .ensure()
        .test(
          'mobile',
          i18next.t(`ValidationErrors.ValidPhoneNumber`),
          (value?: Maybe<string>) => !!value && intl.validatePhoneNumber(value),
        ),
      extension: Yup.string()
        .matches(/^[0-9]*$/, i18next.t(`${I18N_PATH}ValidExtension`))
        .nullable(),
    }),
  ),
  generalNote: Yup.string()
    .max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 256 }))
    .nullable(),
  popupNote: Yup.string()
    .max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 256 }))
    .nullable(),
  billingNote: Yup.string()
    .max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 256 }))
    .nullable(),
  workOrderNote: Yup.string()
    .max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 256 }))
    .nullable(),
  defaultPurchaseOrders: Yup.array().when('poRequired', {
    is: true,
    then: Yup.array()
      .of(Yup.number())
      .required(i18next.t(`${I18N_PATH}PurchaseOrdersRequired`)),
    otherwise: Yup.array().of(Yup.number()),
  }),
});

export const generalInformationCommercialTabSchema = (intl: IntlConfig) =>
  Yup.object().shape(generalInformationCommercialTabShape(intl));

export const generalInformationNonCommercialTabShape = (intl: IntlConfig) => ({
  firstName: Yup.string()
    .trim()
    .required(i18next.t(`${I18N_PATH}FirstNameIsRequired`))
    .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
  lastName: Yup.string()
    .required(i18next.t(`${I18N_PATH}LastNameIsRequired`))
    .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
  email: Yup.string().trim().email(emailValidator).nullable(),
  alternateId: Yup.string().nullable(),
  phoneNumbers: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      number: Yup.string()
        .ensure()
        .test(
          'mobile',
          i18next.t(`ValidationErrors.ValidPhoneNumber`),
          (value?: Maybe<string>) => !!value && intl.validatePhoneNumber(value),
        ),
      extension: Yup.string()
        .matches(/^[0-9]*$/, i18next.t(`${I18N_PATH}ValidExtension`))
        .nullable(),
    }),
  ),
  generalNote: Yup.string()
    .max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 256 }))
    .nullable(),
  popupNote: Yup.string()
    .max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 256 }))
    .nullable(),
  billingNote: Yup.string()
    .max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 256 }))
    .nullable(),
  workOrderNote: Yup.string()
    .max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 256 }))
    .nullable(),
  defaultPurchaseOrders: Yup.array().when('poRequired', {
    is: true,
    then: Yup.array()
      .of(Yup.number())
      .required(i18next.t(`${I18N_PATH}PurchaseOrdersRequired`)),
    otherwise: Yup.array().of(Yup.number()),
  }),
});

export const generalInformationNonCommercialTabSchema = (intl: IntlConfig) =>
  Yup.object().shape(generalInformationNonCommercialTabShape(intl));

export const mainContactTabShape = (intlConfig: IntlConfig) => ({
  mainFirstName: Yup.string()
    .trim()
    .required(i18next.t(`${I18N_PATH}FirstNameIsRequired`))
    .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
  mainLastName: Yup.string()
    .required(i18next.t(`${I18N_PATH}LastNameIsRequired`))
    .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
  mainEmail: Yup.string().trim().email(emailValidator).nullable(),
  mainJobTitle: Yup.string().nullable(),
  mainPhoneNumbers: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      number: Yup.string()
        .ensure()
        .test(
          'mobile',
          i18next.t(`ValidationErrors.ValidPhoneNumber`),
          (value?: Maybe<string>) => !!value && intlConfig.validatePhoneNumber(value),
        ),
      extension: Yup.string()
        .matches(/^[0-9]*$/, i18next.t(`${I18N_PATH}ValidExtension`))
        .nullable(),
    }),
  ),
});

export const mainContactTabSchema = (intl: IntlConfig) =>
  Yup.object().shape(mainContactTabShape(intl));

export const paymentAndBillingTabShape = {
  addFinanceCharges: Yup.boolean(),
  onAccount: Yup.boolean(),
  sendInvoicesByPost: Yup.boolean(),
  sendInvoicesByEmail: Yup.boolean().when('sendInvoicesByPost', {
    is: false,
    then: Yup.boolean().oneOf([true]),
  }),
  autopayType: Yup.string().when('isAutopayExist', {
    is: true,
    then: Yup.string().required('Autopay Type is required'),
  }),
  autopayCreditCardId: Yup.string().when('isAutopayExist', {
    is: true,
    then: Yup.string().required('Autopay Credit Card is required'),
  }),
  creditLimit: Yup.number().when('onAccount', {
    is: true,
    then: Yup.number().required(i18next.t(`${I18N_PATH}creditLimitRequiredField`)),
    otherwise: Yup.number().notRequired(),
  }),
  billingCycle: Yup.string().required(),
  paymentTerms: Yup.string().required(i18next.t(`${I18N_PATH}PaymentTermsAreRequired`)),
  invoiceConstruction: Yup.string().required(
    i18next.t(`${I18N_PATH}InvoiceConstructionIsRequired`),
  ),
  aprType: Yup.string().required(i18next.t(`${I18N_PATH}APRIsRequired`)),
  financeCharge: Yup.number()
    .nullable()
    .when(['addFinanceCharges', 'aprType'], {
      is: (addFinanceCharges, aprType) => addFinanceCharges && aprType === aprTypeOptions[1],
      then: Yup.number()
        .typeError(i18next.t(`${I18N_PATH}ChargeMustBeNumber`))
        .positive(i18next.t(`${I18N_PATH}ChargeMustBeGreaterThanZero`))
        .required(i18next.t(`${I18N_PATH}ChargeIsRequired`)),
    }),
};

export const paymentAndBillingTabSchema = Yup.object().shape(paymentAndBillingTabShape);

export const emailsTabShape = {
  attachTicketPref: Yup.boolean(),
  attachMediaPref: Yup.boolean(),
  statementSameAsInvoiceEmails: Yup.boolean(),
  notificationSameAsInvoiceEmails: Yup.boolean(),
  invoiceEmails: Yup.array()
    .of(Yup.string().email(emailValidator))
    .when('sendInvoicesByEmail', {
      is: true,
      then: Yup.array()
        .min(1, i18next.t(`${I18N_PATH}EmailsAreRequired`))
        .max(5, i18next.t(`${I18N_PATH}EmailsQuantity`)),
    }),
  statementEmails: Yup.array()
    .of(Yup.string().email(emailValidator))
    .when(['statementSameAsInvoiceEmails', 'sendInvoicesByEmail'], {
      is: (statementSameAsInvoiceEmails, sendInvoicesByEmail) =>
        !statementSameAsInvoiceEmails && !!sendInvoicesByEmail,
      then: Yup.array()
        .min(1, i18next.t(`${I18N_PATH}EmailsAreRequired`))
        .max(5, i18next.t(`${I18N_PATH}EmailsQuantity`)),
    }),
  notificationEmails: Yup.array()
    .of(Yup.string().email(emailValidator))
    .when(['notificationSameAsInvoiceEmails', 'sendInvoicesByEmail'], {
      is: (notificationSameAsInvoiceEmails, sendInvoicesByEmail) =>
        !notificationSameAsInvoiceEmails && !!sendInvoicesByEmail,
      then: Yup.array()
        .min(1, i18next.t(`${I18N_PATH}EmailsAreRequired`))
        .max(5, i18next.t(`${I18N_PATH}EmailsQuantity`)),
    }),
};

export const emailsTabSchema = Yup.object().shape(emailsTabShape);

export const addressTabShape = (intl: IntlConfig) => ({
  searchString: Yup.string(),
  mailingAddress: Yup.object()
    .shape({
      addressLine1: Yup.string()
        .required(i18next.t(`${I18N_PATH}AddressLineRequired`, { number: 1 }))
        .max(100, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 100 })),
      addressLine2: Yup.string()
        .nullable()
        .max(100, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 100 })),
      city: Yup.string()
        .required(i18next.t(`${I18N_PATH}CityIsRequired`))
        .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
      state: Yup.string()
        .required(i18next.t(`${I18N_PATH}StateIsRequired`))
        .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
      zip: Yup.string()
        .matches(intl.zipRegexp, 'ZIP must be in correct format')
        .required(i18next.t(`${I18N_PATH}ZipIsRequired`)),
    })
    .required(),
  billingAddress: Yup.object().shape({
    billingAddressSameAsMailing: Yup.boolean(),
    addressLine1: Yup.string().when('billingAddressSameAsMailing', {
      is: false,
      then: Yup.string()
        .required(i18next.t(`${I18N_PATH}AddressLineRequired`, { number: 1 }))
        .max(100, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 100 })),
    }),
    addressLine2: Yup.string()
      .nullable()
      .max(100, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 100 })),
    city: Yup.string().when('billingAddressSameAsMailing', {
      is: false,
      then: Yup.string()
        .required(i18next.t(`${I18N_PATH}CityIsRequired`))
        .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
    }),
    state: Yup.string().when('billingAddressSameAsMailing', {
      is: false,
      then: Yup.string()
        .required(i18next.t(`${I18N_PATH}StateIsRequired`))
        .max(50, i18next.t(`ValidationErrors.PleaseEnterUpTo`, { number: 50 })),
    }),
    zip: Yup.string().when('billingAddressSameAsMailing', {
      is: false,
      then: Yup.string()
        .matches(intl.zipRegexp, 'ZIP must be in correct format')
        .required(i18next.t(`${I18N_PATH}ZipIsRequired`)),
    }),
  }),
});

export const addressTabSchema = (intl: IntlConfig) => Yup.object().shape(addressTabShape(intl));

const defaultValue: INewCustomerData = {
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
  poRequired: false,
  firstName: '',
  lastName: '',
  name: '',
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
  billingCycle: undefined,
  paymentTerms: 'cod',
  aprType: 'standard',
  addFinanceCharges: true,
  mailingAddress: DEFAULT_ADDRESS,
  billingAddress: {
    ...DEFAULT_ADDRESS,
    billingAddressSameAsMailing: true,
  },
  generalNote: '',
  popupNote: '',
  billingNote: '',
  workOrderNote: '',
  contactId: undefined,
  createAndLinkJobSite: false,
  sendInvoicesByEmail: true,
  sendInvoicesByPost: false,
  attachTicketPref: false,
  attachMediaPref: false,
  statementSameAsInvoiceEmails: true,
  notificationSameAsInvoiceEmails: true,
  status: CustomerStatus.active,
  invoiceEmails: [],
  statementEmails: [],
  notificationEmails: [],
  canTareWeightRequired: true,
  gradingNotification: true,
  gradingRequired: true,
  jobSiteRequired: false,
  selfServiceOrderAllowed: false,
  workOrderRequired: false,
  isAutopayExist: false,
  autopayType: undefined,
  autopayCreditCardId: undefined,
  mainCustomerPortalUser: false,
  customerPortalUser: false,
  defaultPurchaseOrders: [],
  purchaseOrders: [],
  spUsed: false,
};

export const getValues = (item?: INewCustomerData | ICustomer): INewCustomerData => {
  if (!item) {
    return defaultValue;
  }
  const billingAddressSameAsMailing = isEqual(item.mailingAddress, item.billingAddress);
  const billingAddress = { ...item.billingAddress, billingAddressSameAsMailing };
  const statementSameAsInvoiceEmails = isEqual(item.invoiceEmails, item.statementEmails);
  const notificationSameAsInvoiceEmails = isEqual(item.invoiceEmails, item.notificationEmails);

  return notNullObject(
    {
      ...item,
      billingAddress,
      statementSameAsInvoiceEmails,
      notificationSameAsInvoiceEmails,
      defaultPurchaseOrders: item.purchaseOrders?.map(({ id }) => id),
    },
    defaultValue,
  );
};
