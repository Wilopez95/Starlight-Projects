import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  defaultValue as jobSiteDefaultValue,
  generateValidationSchema as generateJobSiteValidationSchema,
} from '@root/components/forms/JobSiteEdit/formikData';
import { IJobSiteEditData } from '@root/components/forms/JobSiteEdit/types';
import {
  defaultValue as defaultTaxExemptionValue,
  taxExemptionValidationSchema,
} from '@root/components/forms/TaxExemption/formikData';
import { type FormikTaxExemption } from '@root/components/forms/TaxExemption/types';
import { emailValidator, notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import { type ICustomerJobSitePair, type Maybe } from '@root/types';

import { type CustomerJobSiteNavigationConfigItem } from './navigationConfig';

export interface ICustomerJobSiteSettings {
  information: IJobSiteEditData;
  details?: ICustomerJobSitePair;
  taxExemptions?: FormikTaxExemption;
}

const generateDetailsValidationSchema = (t: TFunction) =>
  Yup.object().shape({
    popupNote: Yup.string().max(256, 'Please enter up to 256 characters').nullable(),
    workOrderNotes: Yup.string().max(256, 'Please enter up to 256 characters').nullable(),
    sendInvoicesToJobSite: Yup.boolean().nullable(),
    defaultPurchaseOrders: Yup.array().when('poRequired', {
      is: true,
      then: Yup.array()
        .of(Yup.number())
        .required(t('ValidationErrors.PurchaseOrderNumberIsRequired')),
      otherwise: Yup.array().of(Yup.number()),
    }),
    invoiceEmails: Yup.array()
      .max(5, 'Email quantity should not be greater than 5')
      .of(Yup.string().email(emailValidator))
      .nullable()
      .test(
        'invoiceEmails',
        'Emails are required',
        function (invoiceEmails?: Maybe<(string | undefined)[]>) {
          return !this.parent.sendInvoicesToJobSite || (invoiceEmails ?? []).length > 0;
        },
      ),
  });

const generateValidationSchemas = (
  intl: IntlConfig,
  t: TFunction,
): Record<CustomerJobSiteNavigationConfigItem, Yup.ObjectSchema> => ({
  information: generateJobSiteValidationSchema(intl),
  details: generateDetailsValidationSchema(t),
  taxExemptions: taxExemptionValidationSchema,
});

export const generateValidationSchema = (
  key: CustomerJobSiteNavigationConfigItem,
  intl: IntlConfig,
  t: TFunction,
) => Yup.object().shape({ [key]: generateValidationSchemas(intl, t)[key] });

const defaultCustomerJobSiteValue: ICustomerJobSitePair = {
  id: 0,
  active: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  customerId: 0,
  jobSiteId: 0,
  permitRequired: false,
  poRequired: false,
  signatureRequired: false,
  cabOver: false,
  alleyPlacement: false,
  popupNote: '',
  taxDistricts: undefined,
  invoiceEmails: [],
  purchaseOrders: [],
  defaultPurchaseOrders: [],
  sendInvoicesToJobSite: false,
  workOrderNotes: null,
};

export const defaultValues: ICustomerJobSiteSettings = {
  information: jobSiteDefaultValue,
  details: defaultCustomerJobSiteValue,
  taxExemptions: defaultTaxExemptionValue,
};

export const getValues = (item?: ICustomerJobSiteSettings): ICustomerJobSiteSettings => {
  if (!item) {
    return defaultValues;
  }

  const jobSite = item.information;
  const showGeofencing = !!jobSite.radius || !!jobSite.polygon;

  const values = {
    information: { ...notNullObject(jobSite, jobSiteDefaultValue), showGeofencing },
    details: item?.details
      ? {
          ...notNullObject(item.details, defaultCustomerJobSiteValue),
          defaultPurchaseOrders: item.details.purchaseOrders?.map(({ id }) => id) ?? [],
        }
      : defaultCustomerJobSiteValue,
    taxExemptions: item?.taxExemptions
      ? notNullObject(item.taxExemptions, defaultTaxExemptionValue)
      : defaultTaxExemptionValue,
  };

  return values;
};
