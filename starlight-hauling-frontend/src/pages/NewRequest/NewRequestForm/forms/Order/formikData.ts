import { endOfDay, format, isBefore, startOfDay } from 'date-fns';
import i18next, { TFunction } from 'i18next';
import { isDate } from 'lodash-es';
import validator from 'validator';
import * as Yup from 'yup';

import { isTimeAfter } from '@root/components/OrderTimePicker/helpers';
import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import {
  BillableItemActionEnum,
  BusinessLineType,
  ClientRequestType,
  defaultReminderSchedule,
  ONLY_NUMBERS_AND_LETTERS,
} from '@root/consts';
import { priceValidator } from '@root/helpers';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { IntlConfig } from '@root/i18n/types';
import { BusinessUnit } from '@root/stores/entities';
import { Maybe, ReminderTypes } from '@root/types';

import { getOrdersTotal } from './helpers';
import { type INewOrderFormData, type INewOrders, type IValidationData } from './types';

const today = new Date();

const billableServiceShape = (values: INewOrders) => {
  const { type } = values;

  return {
    billableServiceId: Yup.number().when('noBillableService', {
      is: false,
      then: Yup.number().required('Service is required'),
    }),
    materialId: Yup.number().when('noBillableService', {
      is: false,
      then: Yup.number().required('Material is required'),
    }),
    billableServicePrice: Yup.number().when('noBillableService', {
      is: false,
      then: Yup.number()
        .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
        .min(0, i18next.t('ValidationErrors.GreaterThanZero'))
        .test(
          'billableServicePrice',
          i18next.t('ValidationErrors.IncorrectPriceFormat'),
          priceValidator,
        )
        .required(i18next.t('ValidationErrors.PriceIsRequired')),
    }),
    billableServiceQuantity: Yup.number()
      .typeError(i18next.t('ValidationErrors.MustInteger'))
      .integer(i18next.t('ValidationErrors.MustInteger'))
      .moreThan(0, i18next.t('ValidationErrors.MustBeGreaterThan0'))
      .required(i18next.t('ValidationErrors.QuantityIsRequired'))
      .test(
        'billableServiceQuantity',
        i18next.t('ValidationErrors.MustBeNotMoreThan10'),
        (value?: Maybe<number>) => {
          if (type === ClientRequestType.SubscriptionOrder) {
            return true;
          }

          return !!value && value < 11;
        },
      ),
  };
};

const disposalSiteServicesList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.liveLoad,
];

const nonServiceRequest = [
  ClientRequestType.NonServiceOrder,
  ClientRequestType.SubscriptionNonService,
];

const lineItemShape = {
  billableLineItemId: Yup.number().required(i18next.t('ValidationErrors.LineItemIsRequired')),
  price: Yup.number()
    .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
    .min(0, i18next.t('ValidationErrors.GreaterThanZero'))
    .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
    .required(i18next.t('ValidationErrors.PriceIsRequired')),
  quantity: Yup.number()
    .typeError(i18next.t('ValidationErrors.MustInteger'))
    .positive(i18next.t('ValidationErrors.MustBeGreaterThan0'))
    .required(i18next.t('ValidationErrors.QuantityIsRequired')),
};

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
          .required(i18next.t('ValidationErrors.CityIsRequired'))
          .max(50, i18next.t('ValidationErrors.PleaseEnterUpTo50Characters')),
        state: Yup.string()
          .required(i18next.t('ValidationErrors.StateIsRequired'))
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
          (value?: Maybe<string>) => !!value && validator.isCreditCard(value),
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

const I18N_FORM_VALIDATORS =
  'pages.NewRequest.NewRequestForm.forms.Order.sections.Order.ValidationErrors.';

export const generateOrderValidationSchema = (
  {
    materialStore,
    billableServiceStore,
    businessLineStore,
    surchargeStore,
    i18nStore,
  }: IValidationData,
  intl: IntlConfig,
  t: TFunction,
) =>
  Yup.lazy(values => {
    const {
      type,
      orders,
      permitRequired,
      businessLineId,
      taxDistricts,
      poRequired,
      commercialTaxesUsed,
    } = values as INewOrders;

    const isSubscriptionOrder = [
      ClientRequestType.SubscriptionOrder,
      ClientRequestType.SubscriptionNonService,
    ].includes(type);

    const businessLineType = businessLineStore?.getById(businessLineId)?.type;
    const isPortableToilets = businessLineType === BusinessLineType.portableToilets;

    const subscriptionOrderQuantity = orders[0].billableServiceQuantity;
    const validateItem = (value?: Maybe<string>) => {
      if (!value) {
        return true;
      }

      return value.split(',').length <= subscriptionOrderQuantity;
    };

    return Yup.object().shape({
      serviceAreaId: Yup.number()
        .typeError(
          i18next.t(`ValidationErrors.IsRequired`, { fieldName: i18next.t(`Text.ServiceArea`) }),
        )
        .required(
          i18next.t(`ValidationErrors.IsRequired`, { fieldName: i18next.t(`Text.ServiceArea`) }),
        ),

      jobSiteId: Yup.number().required(i18next.t(`ValidationErrors.JobSiteIsRequired`)),
      customerId: Yup.number().required(i18next.t(`ValidationErrors.CustomerIsRequired`)),
      jobSiteContactId: Yup.number().test(
        'required',
        i18next.t(`ValidationErrors.JobSiteContactIsRequired`),
        (id?: Maybe<number>) => {
          const isNoBillableService = type === ClientRequestType.NonServiceOrder;

          if (isNoBillableService) {
            return true;
          }

          return !!id;
        },
      ),
      poRequired: Yup.boolean(),
      permitRequired: Yup.boolean(),
      promoApplied: Yup.boolean(),
      promoId: Yup.number()
        .nullable()
        .when('promoApplied', {
          is: true,
          then: Yup.number().required(i18next.t(`ValidationErrors.PromoIsRequired`)),
        }),
      popupNote: Yup.string().max(256, i18next.t(`ValidationErrors.PleaseEnterUpTo256Characters`)),

      ...(!isSubscriptionOrder && {
        payments: Yup.array().of(
          Yup.object().shape({
            amount: Yup.number()
              .typeError(i18next.t('ValidationErrors.MustBeNumeric'))
              .min(0, i18next.t('ValidationErrors.MustBePositive'))
              .test('amount', i18next.t('ValidationErrors.IncorrectAmountFormat'), priceValidator)
              .required(i18next.t('ValidationErrors.AmountIsRequired'))
              .when('paymentMethod', {
                is: paymentMethod =>
                  paymentMethod === 'check' ||
                  paymentMethod === 'cash' ||
                  paymentMethod === 'creditCard',
                then: Yup.number().positive(
                  i18next.t(`ValidationErrors.MustBeGreaterThanZero`, {
                    fieldName: 'Amount',
                  }),
                ),
              }),
            paymentMethod: Yup.string().test(
              'paymentMethod',
              i18next.t(`ValidationErrors.PaymentMethodIsRequired`),
              value => {
                const total = getOrdersTotal({
                  orders,
                  businessLineId,
                  taxDistricts,
                  region: i18nStore.region,
                  surcharges: surchargeStore.values,
                  commercialTaxesUsed,
                });

                if (total === 0) {
                  return true;
                }

                return !!value;
              },
            ),
            checkNumber: Yup.string().when('paymentMethod', {
              is: 'check',
              then: Yup.string()
                .matches(ONLY_NUMBERS_AND_LETTERS, i18next.t(`ValidationErrors.CodeIsAlphaNumeric`))
                .required(i18next.t(`ValidationErrors.NumberCheckIsRequired`)),
            }),
            creditCardId: Yup.number().when('paymentMethod', {
              is: 'creditCard',
              then: Yup.number().required(i18next.t(`ValidationErrors.CreditCardIsRequired`)),
              otherwise: Yup.number().nullable(),
            }),
            deferredPayment: Yup.boolean(),
            deferredUntil: Yup.date().when('deferredPayment', {
              is: true,
              then: Yup.date()
                .required(i18next.t(`ValidationErrors.DeferredUntilIsRequired`))
                .test(
                  'deferredUntil',
                  i18next.t(`ValidationErrors.DeferredPaymentDateMustBeBeforeServiceDate`),
                  date => {
                    if (!date) {
                      return true;
                    }

                    return orders.every(order => isBefore(date, order.serviceDate));
                  },
                )
                .test(
                  'deferredUntil',
                  i18next.t(
                    `ValidationErrors.PaymentCannotBeDeferredForTodayOrPastPleaseCheckServiceDateOrDeferredDate`,
                  ),
                  date => {
                    if (!date) {
                      return true;
                    }

                    return isBefore(new Date(), date);
                  },
                ),
            }),
            ...creditCardShape(intl),
          }),
        ),
      }),

      orders: Yup.array().of(
        Yup.object().shape({
          orderContactId: Yup.number().required(
            i18next.t(`ValidationErrors.OrderContactIsRequired`),
          ),
          customRatesGroupId: Yup.number().required(
            i18next.t(`ValidationErrors.PriceGroupIsRequired`),
          ),
          permitId: Yup.number().test(
            'permitRequired',
            i18next.t(`ValidationErrors.PermitIsRequired`),
            value => {
              const isNoBillableService = type === ClientRequestType.NonServiceOrder;

              if (isNoBillableService) {
                return true;
              }

              if (permitRequired && !value) {
                return false;
              }

              return true;
            },
          ),
          purchaseOrderId: Yup.number().when('isOneTimePO', {
            is: isOneTimePO => poRequired && !isOneTimePO,
            then: Yup.number().required(t('ValidationErrors.PurchaseOrderNumberIsRequired')),
          }),
          oneTimePurchaseOrderNumber: Yup.string().when('isOneTimePO', {
            is: isOneTimePO => poRequired && !!isOneTimePO,
            then: Yup.string().required(t('ValidationErrors.PurchaseOrderNumberIsRequired')),
            otherwise: Yup.string(),
          }),
          serviceDate: Yup.date()
            .required(i18next.t(`ValidationErrors.ServiceDateIsRequired`))
            .test(
              'isNotBefore',
              t(`ValidationErrors.MustNotBeLessThanToday`),
              (date?: Maybe<Date>) => {
                if (!nonServiceRequest.includes(type)) {
                  return !!date && !isBefore(startOfDay(date), startOfDay(today));
                }

                return true;
              },
            )
            .test(
              'isFutureDate',
              t(`ValidationErrors.MustBeEqualOrLessThanToday`),
              (date?: Maybe<Date>) => {
                if (nonServiceRequest.includes(type)) {
                  return !!date && isBefore(date, endOfDay(today));
                }

                return true;
              },
            ),
          jobSite2Id: Yup.number().test(
            'required',
            i18next.t(`ValidationErrors.RelocationAddressIsRequired`),
            function (val?: Maybe<number>) {
              const { billableServiceId } = this.parent;

              if (
                billableServiceStore.getById(billableServiceId as number)?.action === 'relocate' &&
                val === undefined &&
                !isPortableToilets
              ) {
                return false;
              }

              return true;
            },
          ),
          materialProfileId: Yup.number().test(
            'required',
            i18next.t(`ValidationErrors.MaterialProfileIsRequired`),
            function (val?: Maybe<number>) {
              const manifested = materialStore.getById(
                this.parent.materialId as number,
              )?.manifested;
              const serviceAction = billableServiceStore.getById(
                this.parent.billableServiceId as number,
              )?.action;

              if (
                !isSubscriptionOrder &&
                manifested &&
                serviceAction &&
                disposalSiteServicesList.includes(serviceAction) &&
                val === undefined &&
                !isPortableToilets
              ) {
                return false;
              }

              return true;
            },
          ),
          disposalSiteId: Yup.number().nullable(),
          callOnWayPhoneNumberId: Yup.number().nullable(),
          textOnWayPhoneNumberId: Yup.number().nullable(),
          droppedEquipmentItem: Yup.string()
            .nullable()
            .when('droppedEquipmentItemApplied', {
              is: true,
              then: Yup.string().required(
                i18next.t(`ValidationErrors.AssignedEquipmentIsRequired`),
              ),
            }),
          notifyDayBefore: Yup.string()
            .nullable()
            .when('notificationApplied', {
              is: true,
              then: Yup.string().required(i18next.t(`ValidationErrors.ReminderIsRequired`)),
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
                  const timeTo = isDate(date)
                    ? format(date, dateFormatsEnUS.time24)
                    : (date as string);

                  return isTimeAfter(timeFrom, timeTo);
                },
              ),
          }),
          ...billableServiceShape(values as INewOrders),
          lineItems: Yup.array()
            .of(Yup.object().shape(lineItemShape))
            .test(
              'required',
              i18next.t(`ValidationErrors.AtLeastOneLineItemShouldBeAdded`),
              (items: Maybe<unknown[]> = []) => {
                const isNonService = [
                  ClientRequestType.NonServiceOrder,
                  ClientRequestType.SubscriptionNonService,
                ].includes(type);

                if (!isNonService) {
                  return true;
                }

                return !!items && items.length > 0;
              },
            ),
          droppedEquipmentItemCode: Yup.string().test(
            'lessThanQuantity',
            i18next.t(`ValidationErrors.ItemsNumberLessOrEqualQuantity`),
            validateItem,
          ),
          pickedUpEquipmentItemCode: Yup.string().test(
            'lessThanQuantity',
            i18next.t(`ValidationErrors.ItemsNumberLessOrEqualQuantity`),
            validateItem,
          ),
        }),
      ),
      ...(isPortableToilets && {
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
      }),
    });
  });

export const getDefaultOrderValue = (
  applySurcharges: boolean,
  purchaseOrderId?: number,
): INewOrderFormData => ({
  droppedEquipmentItemComment: '',
  jobSite2IdSearchString: '',
  promoApplied: false,
  noBillableService: false,
  droppedEquipmentItemApplied: false,
  someoneOnSite: false,
  toRoll: false,
  highPriority: false,
  earlyPick: false,
  orderContactId: 0,
  jobSite2Id: undefined,
  billableServiceId: undefined,
  materialId: undefined,
  billableServicePrice: undefined,
  billableServiceQuantity: 1,
  globalRatesServicesId: undefined,
  customRatesGroupServicesId: undefined,
  equipmentItemsMaterialsOptions: [],
  serviceDate: today,
  callOnWayPhoneNumber: undefined,
  callOnWayPhoneNumberId: undefined,
  textOnWayPhoneNumber: undefined,
  textOnWayPhoneNumberId: undefined,
  lineItems: [],
  driverInstructions: undefined,
  permitId: undefined,
  isOneTimePO: false,
  purchaseOrder: undefined,
  purchaseOrderId,
  bestTimeToCome: 'any',
  bestTimeToComeFrom: null,
  bestTimeToComeTo: null,
  disposalSiteId: undefined,
  notifyDayBefore: null,
  notificationApplied: false,
  equipmentItemId: undefined,
  thirdPartyHaulerId: undefined,
  customRatesGroupId: 0,
  droppedEquipmentItem: undefined,
  assignEquipmentItem: false,
  selectedGroup: null,
  jobSite2Label: undefined,
  route: null,
  applySurcharges,
});

export const getOrderValue = (
  currentBusinessUnit?: BusinessUnit,
  purchaseOrderId?: number,
): INewOrders => {
  const applySurcharges = currentBusinessUnit?.applySurcharges ?? false;

  return {
    type: ClientRequestType.Unknown,
    searchString: '',
    businessUnitId: '',
    businessLineId: '',
    customerId: 0,
    jobSiteId: 0,
    projectId: undefined,
    jobSiteContactId: 0,
    promoId: null,
    customerJobSiteId: undefined,
    grandTotal: 0,
    poRequired: false,
    permitRequired: false,
    signatureRequired: false,
    cabOver: false,
    alleyPlacement: false,
    workOrderNote: '',
    popupNote: '',
    commercialTaxesUsed: true,
    orders: [getDefaultOrderValue(applySurcharges, purchaseOrderId)],
    applySurcharges,
    payments: [
      {
        paymentMethod: 'onAccount',
        amount: 0,
        sendReceipt: false,
        authorizeCard: false,
        isAch: false,
      },
    ],
    unlockOverrides: false,
    surcharges: [],
    annualReminderConfig: {
      type: ReminderTypes.OrderAnnualEventReminder,
      ...defaultReminderSchedule,
    },
  };
};
