import { TFunction } from 'i18next';
import { omit } from 'lodash-es';
import * as Yup from 'yup';

import {
  addressValidationSchema,
  getAddressesFormValues,
  mailingAddressValidationSchema,
} from '@root/components/ConfigurationAddresses/formikData';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import { emailValidator, notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import {
  BusinessUnitType,
  IBusinessUnitWithServiceDays,
  IServiceDaysAndTime,
  Maybe,
} from '@root/types';

import {
  requireValidTimeAfterStartIfDayEnabled,
  requireValidTimeIfDayEnabled,
} from './sections/ServiceDaysAndTime/formikData';
import { BusinessUnitFormData } from './types';

const setDefaultServiceDays = (type: BusinessUnitType): IServiceDaysAndTime[] => {
  const isRecyclingBU = type === BusinessUnitType.RECYCLING_FACILITY;

  return isRecyclingBU
    ? [0, 1, 2, 3, 4, 5, 6].map(dayNumber => ({
        dayOfWeek: dayNumber,
        startTime: null,
        endTime: null,
        active: false,
      }))
    : [];
};

export const validationSchema = (
  type: BusinessUnitType,
  intl: IntlConfig,
  t: TFunction,
  i18n: string,
) =>
  Yup.object().shape({
    nameLine1: Yup.string()
      .max(120, t(`ValidationErrors.MaxLength`, { number: 120 }))
      .required(t(`${i18n}CompanyNameLine1Required`)),
    nameLine2: Yup.string()
      .max(120, t(`ValidationErrors.MaxLength`, { number: 120 }))
      .notRequired()
      .nullable(),
    logoUrl: Yup.string().nullable(),
    image: Yup.mixed()
      .notRequired()
      .test('isFile', t(`${i18n}ImageMust`), value => !value || value instanceof File)
      .nullable(),
    email: Yup.string().trim().email(emailValidator).notRequired().nullable(),
    website: Yup.string()
      .url(t(`${i18n}WrongWebsiteFormat`))
      .nullable(),
    phone: Yup.string()
      .required(t(`${i18n}PhoneRequired`))
      .ensure()
      .test('mobile', t(`${i18n}ValidPhone`), value => !!value && intl.validatePhoneNumber(value)),
    fax: Yup.string()
      .notRequired()
      .nullable()
      .ensure()
      .test('mobile', t(`${i18n}ValidPhone`), value =>
        value !== '' ? !!value && intl.validatePhoneNumber(value) : true,
      ),
    physicalAddress: addressValidationSchema(intl),
    mailingAddress: mailingAddressValidationSchema(intl),
    businessLines:
      !isCore || enableRecyclingFeatures
        ? Yup.array()
            .of(
              Yup.object().shape({
                id: Yup.lazy(value =>
                  typeof value === 'string' ? Yup.string() : Yup.number().positive(),
                ),
                name: Yup.string().required(t(`${i18n}LoBNameRequired`)),

                description: Yup.string().nullable(),
                type: Yup.string().required(t(`${i18n}LoBTypeRequired`)),
                billingType: Yup.string().required(t(`${i18n}LoBBillingTypeRequired`)),
                billingCycle: Yup.string().required(t(`${i18n}LoBBillingCycleRequired`)),
              }),
            )
            .required(
              t(
                `${i18n}${
                  type === BusinessUnitType.RECYCLING_FACILITY ? 'LoBRequired' : 'AtLeastOneLine'
                }`,
              ),
            )
        : Yup.mixed(),
    serviceDays:
      type === BusinessUnitType.RECYCLING_FACILITY
        ? Yup.array().of(
            Yup.object().shape({
              dayOfWeek: Yup.number().required(t(`${i18n}TimeInvalid`)),
              startTime: requireValidTimeIfDayEnabled(t, i18n),
              endTime: requireValidTimeAfterStartIfDayEnabled(t, i18n),
              active: Yup.boolean().required(t(`${i18n}TimeInvalid`)),
            }),
          )
        : Yup.mixed(),
    requireDestinationOnWeightOut: Yup.boolean(),
    requireOriginOfInboundLoads: Yup.boolean(),
    printNodeApiKey: Yup.string()
      .test('isConvertableToBase64', t(`${i18n}InvalidCharacters`), (value?: Maybe<string>) => {
        if (!value) {
          return true;
        }

        try {
          btoa(value);

          return true;
        } catch {
          return false;
        }
      })
      .nullable(),
  });

const defaultValue = (type: BusinessUnitType): BusinessUnitFormData => ({
  id: -1,
  type: BusinessUnitType.HAULING,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  businessLines: [],
  logoUrl: null,
  nameLine1: '',
  nameLine2: null,
  coordinates: null,
  phone: '',
  fax: null,
  website: null,
  email: null,
  timeZoneName: null,
  financeChargeApr: null,
  financeChargeMethod: null,
  financeChargeMinBalance: null,
  financeChargeMinValue: null,
  printNodeApiKey: null,
  merchant: null,
  applySurcharges: true,
  logo: undefined,
  spUsed: false,
  ...getAddressesFormValues(),
  serviceDays: setDefaultServiceDays(type),
  requireDestinationOnWeightOut: false,
  requireOriginOfInboundLoads: false,
});

export const getFormValues = (
  type: BusinessUnitType,
  item?: IBusinessUnitWithServiceDays | null,
): BusinessUnitFormData => {
  const defaultData = defaultValue(type);

  if (!item) {
    return {
      ...defaultData,
      type,
      applySurcharges: type === BusinessUnitType.HAULING,
    };
  }
  if (item?.merchant) {
    item.merchant.spMidConfirmed = !!item.merchant?.salespointMid;
    item.merchant.coreMidConfirmed = !!item.merchant?.mid;
  }

  return {
    ...notNullObject(item, defaultData),
    ...getAddressesFormValues(item),
    serviceDays: item?.serviceDays ?? defaultData.serviceDays,
  };
};

export const getEntityValues = ({
  mailingAddress,
  merchant,
  ...formValues
}: BusinessUnitFormData): IBusinessUnitWithServiceDays => ({
  ...formValues,
  mailingAddress: mailingAddress.sameAsPhysical
    ? formValues.physicalAddress
    : omit(mailingAddress, 'sameAsPhysical'),
  merchant: merchant
    ? {
        ...merchant,
        password: merchant.password ?? null,
        salespointPassword: merchant.salespointPassword ?? null,
      }
    : null,
});
