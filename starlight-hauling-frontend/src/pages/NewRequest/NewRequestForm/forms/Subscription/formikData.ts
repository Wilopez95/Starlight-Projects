import { format, isAfter } from 'date-fns';
import i18next from 'i18next';
import { isDate } from 'lodash-es';
import validator from 'validator';
import * as Yup from 'yup';

import { isTimeAfter } from '@root/components/OrderTimePicker/helpers';
import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import {
  BillingCycleEnum,
  BusinessLineType,
  ClientRequestType,
  defaultReminderSchedule,
  ONLY_NUMBERS_AND_LETTERS,
} from '@root/consts';
import { priceValidator } from '@root/helpers';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { IntlConfig } from '@root/i18n/types';
import { BusinessLineStore } from '@root/stores/businessLine/BusinessLineStore';
import { Maybe, ReminderTypes } from '@root/types';

import {
  type INewSubscription,
  type INewSubscriptionFormData,
  type INewSubscriptionLineItem,
  type INewSubscriptionOrder,
  INewSubscriptionService,
} from './types';

const lineItemShape = {
  billableLineItemId: Yup.number()
    .positive(i18next.t('ValidationErrors.LineItemIsRequired'))
    .required(i18next.t('ValidationErrors.LineItemIsRequired')),
  price: Yup.number()
    .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
    .min(0, i18next.t('ValidationErrors.GreaterThanZero'))
    .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
    .required(i18next.t('ValidationErrors.IsRequired', { fieldName: i18next.t(`Form.Price`) })),
  quantity: Yup.number().typeError(i18next.t('ValidationErrors.MustInteger')).required(''),
};

const generateBillableServiceValidationSchema = (isSubscriptionEdit?: boolean, isDraft?: boolean) =>
  Yup.lazy(_values => {
    const values = _values as INewSubscriptionService;

    if (isDraft && values.quantity === 0) {
      return Yup.object();
    }

    return Yup.object().shape({
      billableServiceId: Yup.number().required(i18next.t('ValidationErrors.ServiceIsRequired')),
      materialId: Yup.number().required(i18next.t('ValidationErrors.MaterialIsRequired')),
      price: Yup.number()
        .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
        .min(0, i18next.t('ValidationErrors.GreaterThanZero'))
        .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
        .required(
          i18next.t('ValidationErrors.IsRequired', {
            fieldName: i18next.t(`Form.Price`),
          }),
        ),
      serviceFrequencyId: Yup.string()
        .nullable()
        .when('serviceFrequencyOptions', {
          is: (serviceFrequencyOptions: string[]) => serviceFrequencyOptions.length,
          then: Yup.string().required(i18next.t('ValidationErrors.FrequencyIsRequired')),
        }),
      quantity: Yup.number()
        .typeError(i18next.t('ValidationErrors.MustInteger'))
        .integer(i18next.t('ValidationErrors.MustInteger'))
        .lessThan(101, 'Must be not more than 100')
        .required(i18next.t('ValidationErrors.QuantityIsRequired')),
      showEffectiveDate: Yup.boolean(),
      effectiveDate: Yup.date()
        .nullable()
        .when('showEffectiveDate', {
          is: value => !!value && isSubscriptionEdit,
          then: Yup.date()
            .required(i18next.t('ValidationErrors.EffectiveDateIsRequired'))
            .nullable(),
        }),
      lineItems: Yup.array().of(Yup.object().shape(lineItemShape)),
      subscriptionOrders: Yup.array().of(
        Yup.object().shape({
          billableServiceId: Yup.number().required(
            i18next.t('ValidationErrors.SubscriptionOrderIsRequired'),
          ),
          price: Yup.number()
            .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
            .min(0, i18next.t('ValidationErrors.GreaterThanZero'))
            .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
            .required(
              i18next.t('ValidationErrors.IsRequired', {
                fieldName: i18next.t(`Form.Price`),
              }),
            ),
          serviceDate: Yup.date().when([], {
            is: () => !isDraft,
            then: Yup.date().required(i18next.t('ValidationErrors.ServiceDateIsRequired')),
          }),
          quantity: Yup.number()
            .typeError(i18next.t('ValidationErrors.MustInteger'))
            .required(i18next.t('ValidationErrors.QuantityIsRequired')),
        }),
      ),
      serviceDaysOfWeek: Yup.array().of(
        Yup.object().shape({
          day: Yup.string().required(i18next.t('ValidationErrors.ServiceDayIsRequired')),
          route: Yup.string(),
          requiredByCustomer: Yup.boolean(),
        }),
      ),
    });
  });

const I18N_FORM_VALIDATORS =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.ValidationErrors.';

export const creditCardShape = (intl: IntlConfig) => ({
  newCreditCard: Yup.mixed().when(['paymentMethod', 'creditCardId'], {
    is: (paymentMethod: string, creditCardId: number) =>
      paymentMethod === 'creditCard' && creditCardId === 0,
    then: Yup.object()
      .shape({
        active: Yup.boolean().required(),
        cardNickname: Yup.string(),
        addressLine1: Yup.string()
          .required(i18next.t('ValidationErrors.AddressLine1IsRequired'))
          .max(100, i18next.t('ValidationErrors.PleaseEnterUpTo100Characters')),
        addressLine2: Yup.string()
          .nullable()
          .max(100, i18next.t('ValidationErrors.PleaseEnterUpTo100Characters')),
        city: Yup.string()
          .required('City is required')
          .max(50, i18next.t('ValidationErrors.PleaseEnterUpTo50Characters')),
        state: Yup.string()
          .required('State is required')
          .max(50, i18next.t('ValidationErrors.PleaseEnterUpTo50Characters')),
        zip: Yup.string()
          .matches(intl.zipRegexp, i18next.t('ValidationErrors.ZipMustBe'))
          .required(i18next.t('ValidationErrors.ZipIsRequired')),
        cvv: Yup.string()
          .min(3, i18next.t('ValidationErrors.CVVMustBeAtLeast3CharactersLong'))
          .max(4, i18next.t('ValidationErrors.PleaseEnterUpTo4Characters'))
          .matches(/\d{3,4}/, i18next.t('ValidationErrors.InvalidCVVType'))
          .required(i18next.t('ValidationErrors.CVVIsRequired')),
        cardNumber: Yup.string().test(
          'cardNumber',
          i18next.t('ValidationErrors.PleaseEnterAValidCardNumber'),
          (value?: Maybe<string>) => {
            return !!value && validator.isCreditCard(value);
          },
        ),
        nameOnCard: Yup.string().required(i18next.t('ValidationErrors.NameOnCardIsRequired')),
        expirationMonth: Yup.string().test(
          'expirationMonth',
          i18next.t('ValidationErrors.InvalidExpirationDate'),
          function (expirationMonth) {
            const month = +expirationMonth!;

            const now = new Date();

            now.setMonth(now.getMonth() - 1);

            return now < new Date(+`20${this.parent.expirationYear as string}`, month - 1);
          },
        ),
        expirationYear: Yup.string().required(i18next.t('ValidationErrors.InvalidExpirationDate')),
      })
      .required(),
  }),
});

export const generateSubscriptionValidationSchema = ({
  businessLineStore,
  isSubscriptionEdit,
  isDraft,
  intl,
}: {
  businessLineStore: BusinessLineStore;
  isSubscriptionEdit?: boolean;
  intl: IntlConfig;
  isDraft?: boolean;
}) => {
  return Yup.lazy(_values => {
    const values = _values as INewSubscription;
    const businessLineType = businessLineStore.getById(values.businessLineId)?.type;

    return Yup.object().shape({
      serviceAreaId: Yup.number().required(
        i18next.t(`ValidationErrors.IsRequired`, { fieldName: i18next.t(`Text.ServiceArea`) }),
      ),
      jobSiteId: Yup.number().required(i18next.t('ValidationErrors.JobSiteIsRequired')),
      customerId: Yup.number().required(i18next.t('ValidationErrors.CustomerIsRequired')),
      jobSiteContactId: Yup.number()
        .positive(i18next.t('ValidationErrors.JobSiteContactIsRequired'))
        .required(i18next.t('ValidationErrors.JobSiteContactIsRequired')),
      someoneOnSite: Yup.boolean(),
      poRequired: Yup.boolean(),
      permitRequired: Yup.boolean(),
      promoApplied: Yup.boolean(),
      promoId: Yup.number()
        .nullable()
        .when('promoApplied', {
          is: true,
          then: Yup.number().required(i18next.t('ValidationErrors.PromoIsRequired')),
        }),
      popupNote: Yup.string().max(256, i18next.t('ValidationErrors.PleaseEnterUpTo256Characters')),
      payments: Yup.array().of(
        Yup.object().shape({
          amount: Yup.number()
            .typeError(i18next.t('ValidationErrors.MustBeNumeric'))
            .positive(i18next.t('ValidationErrors.MustBePositive'))
            .test('amount', i18next.t('ValidationErrors.IncorrectAmountFormat'), priceValidator)
            .required('Amount is required'),
          paymentMethod: Yup.string().required(
            i18next.t('ValidationErrors.PaymentMethodIsRequired'),
          ),
          checkNumber: Yup.string().when('paymentMethod', {
            is: 'check',
            then: Yup.string()
              .matches(ONLY_NUMBERS_AND_LETTERS, i18next.t('ValidationErrors.CodeIsAlphaNumeric'))
              .required(i18next.t('ValidationErrors.NumberCheckIsRequired')),
          }),
          creditCardId: Yup.number().when('paymentMethod', {
            is: 'creditCard',
            then: Yup.number().required(i18next.t('ValidationErrors.CreditCardIsRequired')),
          }),
          ...creditCardShape(intl),
        }),
      ),
      orderContactId: Yup.number().required(i18next.t('ValidationErrors.OrderContactIsRequired')),
      customRatesGroupId: Yup.number().required(i18next.t('ValidationErrors.PriceGroupIsRequired')),
      permitId: Yup.number().when('permitRequired', {
        is: permitRequired =>
          !!permitRequired && !isDraft && businessLineType === BusinessLineType.portableToilets,
        then: Yup.number().required(i18next.t('ValidationErrors.PermitIsRequired')),
      }),
      purchaseOrderId: Yup.number().when(['poRequired', 'isOneTimePO'], {
        is: (poRequired, isOneTimePO) => !!poRequired && !isDraft && !isOneTimePO,
        then: Yup.number().required(i18next.t('ValidationErrors.PurchaseOrderNumberIsRequired')),
      }),
      bestTimeToCome: Yup.string(),
      bestTimeToComeFrom: Yup.mixed()
        .nullable()
        .when('bestTimeToCome', {
          is: (bestTimeToCome: BestTimeToCome) => bestTimeToCome !== 'any',
          then: Yup.mixed().required(i18next.t(`ValidationErrors.TimeIsRequired`)),
        }),
      bestTimeToComeTo: Yup.mixed().when('bestTimeToCome', {
        is: (bestTimeToCome: BestTimeToCome) => bestTimeToCome !== 'any',
        then: Yup.mixed()
          .required(i18next.t(`ValidationErrors.TimeIsRequired`))
          .test(
            'bestTimeToComeTo',
            i18next.t(`ValidationErrors.MustBeGreaterThanFromTime`),
            function (date: Maybe<unknown>) {
              const timeFrom: string = isDate(this.parent.bestTimeToComeFrom)
                ? format(this.parent.bestTimeToComeFrom as Date, dateFormatsEnUS.time24)
                : this.parent.bestTimeToComeFrom;
              const timeTo = isDate(date) ? format(date, dateFormatsEnUS.time24) : (date as string);

              return isTimeAfter(timeFrom, timeTo);
            },
          ),
      }),
      serviceItems: Yup.array().of(
        generateBillableServiceValidationSchema(isSubscriptionEdit, isDraft),
      ),
      startDate: Yup.date().required(i18next.t('ValidationErrors.StartDateIsRequired')),
      endDate: Yup.date().test(
        'endDate',
        i18next.t('ValidationErrors.MustBeGreaterThanStartDate'),
        function (date) {
          if (!this.parent.startDate || !date) {
            return true;
          }

          return isAfter(date, this.parent.startDate as Date);
        },
      ),
      minBillingPeriods: Yup.number()
        .test(
          'minBillingPeriods',
          i18next.t('ValidationErrors.ANumberShouldNotBeGreaterThan999'),
          value => {
            return !value || value <= 999;
          },
        )
        .nullable(),
      annualReminderConfig: Yup.object().shape({
        date: Yup.date().nullable(),
        informBy: Yup.object()
          .shape({
            informByApp: Yup.boolean(),
            informByEmail: Yup.boolean(),
            informBySms: Yup.boolean(),
          })
          .test(
            'atLeastOne',
            i18next.t(`${I18N_FORM_VALIDATORS}PleaseSelectReminder`),
            function (informBy) {
              if (this.parent.date) {
                return !!(
                  informBy?.informByApp ||
                  informBy?.informByEmail ||
                  informBy?.informBySms
                );
              }

              return true;
            },
          ),
      }),
      competitorId: Yup.number(),
      competitorExpirationDate: Yup.date(),
      billingCycle: Yup.string().required(i18next.t('ValidationErrors.BillingCycleIsRequired')),
      billingType: Yup.string().required(i18next.t('ValidationErrors.BillingTypeIsRequired')),
      anniversaryBilling: Yup.boolean(),
      serviceDaysOfWeek: Yup.array().of(
        Yup.object().shape({
          day: Yup.string().required(i18next.t('ValidationErrors.ServiceDayIsRequired')),
          route: Yup.string(),
        }),
      ),
    });
  });
};

export const editableServiceItemProps: (keyof INewSubscriptionService)[] = [
  'billableServiceId',
  'serviceFrequencyId',
  'materialId',
  'quantity',
  'serviceDaysOfWeek',
  'price',
  'unlockOverrides',
];

export const editableLineItemProps: (keyof INewSubscriptionLineItem)[] = [
  'billableLineItemId',
  'quantity',
  'price',
  'unlockOverrides',
];

export const editableSubscriptionOrderProps: (keyof INewSubscriptionOrder)[] = [
  'quantity',
  'price',
  'serviceDate',
  'unlockOverrides',
];

const defaultSubscriptionValue: INewSubscriptionFormData = {
  id: 0,
  promoApplied: false,
  highPriority: false,
  someoneOnSite: false,
  orderContactId: 0,
  serviceItems: [
    {
      id: 0,
      billableServiceId: undefined,
      materialId: undefined,
      unlockOverrides: false,
      price: 0,
      quantity: 1,
      globalRatesRecurringServicesId: undefined,
      customRatesGroupServicesId: undefined,
      serviceFrequencyId: null,
      effectiveDate: null,
      showEffectiveDate: false,
      lineItems: [],
      subscriptionOrders: [],
      optionalSubscriptionOrders: [],
      serviceDaysOfWeek: [],
      equipmentItemsMaterialsOptions: [],
      serviceFrequencyOptions: [],
      billingCycle: BillingCycleEnum.monthly,
      preSelectedService: undefined,
    },
  ],
  driverInstructions: undefined,
  permitId: undefined,
  purchaseOrder: undefined,
  purchaseOrderId: undefined,
  bestTimeToCome: 'any',
  bestTimeToComeFrom: null,
  bestTimeToComeTo: null,
  thirdPartyHaulerId: undefined,
  customRatesGroupId: 0,
  customRatesGroupOptions: [],
  priceGroupOptions: [],
  billingType: undefined,
  billingCycle: undefined,
  anniversaryBilling: false,
  droppedEquipmentItem: undefined,
  servicesQuantity: undefined,
  minBillingPeriods: null,
  annualReminderConfig: {
    type: ReminderTypes.AnnualEventReminder,
    ...defaultReminderSchedule,
  },
};

export const newSubscriptionFormValue: INewSubscription = {
  type: ClientRequestType.Unknown,
  searchString: '',
  businessUnitId: '',
  businessLineId: '',
  customerId: 0,
  jobSiteId: 0,
  jobSiteContactId: 0,
  customerJobSiteId: undefined,
  promoId: null,
  grandTotal: 0,
  recurringGrandTotal: 0,
  poRequired: false,
  permitRequired: false,
  signatureRequired: false,
  alleyPlacement: false,
  popupNote: '',
  unlockOverrides: false,
  overrideCreditLimit: false,
  ...defaultSubscriptionValue,
};
