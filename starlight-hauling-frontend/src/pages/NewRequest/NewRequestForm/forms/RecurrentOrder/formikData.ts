import { ISelectOption } from '@starlightpro/shared-components';
import { differenceInCalendarDays, format, isBefore, startOfDay } from 'date-fns';
import i18next, { TFunction } from 'i18next';
import { isDate } from 'lodash-es';
import * as Yup from 'yup';

import { isTimeAfter } from '@root/components/OrderTimePicker/helpers';
import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import { BillableItemActionEnum, ClientRequestType } from '@root/consts';
import { priceValidator } from '@root/helpers';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { Maybe } from '@root/types';

import { INewOrderFormData, IOrderSummarySection, IValidationData } from '../Order/types';

import {
  INewRecurrentOrder,
  INewRecurrentOrderFormData,
  RecurrentFormCustomFrequencyType,
  RecurrentFormFrequencyType,
} from './types';

const disposalSiteServicesList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.liveLoad,
];

export const frequencyTypeOptions: RecurrentFormFrequencyType[] = [
  RecurrentFormFrequencyType.daily,
  RecurrentFormFrequencyType.weekly,
  RecurrentFormFrequencyType.monthly,
  RecurrentFormFrequencyType.custom,
];

export const customFrequencyTypes: RecurrentFormCustomFrequencyType[] = [
  RecurrentFormCustomFrequencyType.daily,
  RecurrentFormCustomFrequencyType.weekly,
  RecurrentFormCustomFrequencyType.monthly,
];

export const customFrequencyTypeOptions: ISelectOption[] = [
  { value: RecurrentFormCustomFrequencyType.daily, label: i18next.t('Text.Day') },
  { value: RecurrentFormCustomFrequencyType.weekly, label: i18next.t('Text.Week') },
  { value: RecurrentFormCustomFrequencyType.monthly, label: i18next.t('Text.Month') },
];

const billableServiceShape = {
  billableServiceId: Yup.number().required(i18next.t('ValidationErrors.ServiceIsRequired')),
  materialId: Yup.number().required(i18next.t('ValidationErrors.MaterialIsRequired')),
  billableServicePrice: Yup.number()
    .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
    .min(0, i18next.t('ValidationErrors.GreaterThanZero'))
    .test(
      'billableServicePrice',
      i18next.t('ValidationErrors.IncorrectPriceFormat'),
      priceValidator,
    )
    .required(i18next.t('ValidationErrors.PriceIsRequired')),
  billableServiceQuantity: Yup.number()
    .typeError(i18next.t('ValidationErrors.MustInteger'))
    .integer(i18next.t('ValidationErrors.MustInteger'))
    .moreThan(0, i18next.t('ValidationErrors.MustBeGreaterThan0'))
    .lessThan(11, i18next.t('ValidationErrors.MustBeNotMoreThan10'))
    .required(i18next.t('ValidationErrors.QuantityIsRequired')),
};

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

const getOrderShape = (
  {
    materialStore,
    billableServiceStore,
    permitRequired,
    poRequired,
  }: IValidationData & {
    permitRequired: boolean;
    poRequired: boolean;
  },
  t: TFunction,
) => ({
  orderContactId: Yup.number().required(i18next.t('ValidationErrors.OrderContactIsRequired')),
  customRatesGroupId: Yup.number().required(i18next.t('ValidationErrors.PriceGroupIsRequired')),
  permitId: Yup.number().test(
    'permitRequired',
    i18next.t('ValidationErrors.PermitIsRequired'),
    value => {
      if (permitRequired && !value) {
        return false;
      }

      return true;
    },
  ),
  purchaseOrderId: Yup.number().when('isOneTimePO', {
    is: isOneTimePO => poRequired && !isOneTimePO,
    then: Yup.number().required(t(`ValidationErrors.PurchaseOrderNumberIsRequired`)),
  }),
  oneTimePurchaseOrderNumber: Yup.string().when('isOneTimePO', {
    is: isOneTimePO => poRequired && !!isOneTimePO,
    then: Yup.string().required(t(`ValidationErrors.PurchaseOrderNumberIsRequired`)),
    otherwise: Yup.string(),
  }),
  materialProfileId: Yup.number().test(
    'required',
    i18next.t('ValidationErrors.MaterialProfileIsRequired'),
    function (val?: Maybe<number>) {
      const manifested = materialStore.getById(this.parent.materialId as number)?.manifested;
      const serviceAction = billableServiceStore.getById(
        this.parent.billableServiceId as number,
      )?.action;

      if (
        manifested &&
        serviceAction &&
        disposalSiteServicesList.includes(serviceAction) &&
        val === undefined
      ) {
        return false;
      }

      return true;
    },
  ),
  disposalSiteId: Yup.number().test(
    'required',
    i18next.t('ValidationErrors.DisposalSiteIsRequired'),
    function (val?: Maybe<number>) {
      const { billableServiceId } = this.parent;
      const serviceAction = billableServiceStore.getById(billableServiceId as number)?.action;
      const isIncluding =
        serviceAction && ['final', 'switch', 'liveLoad', 'dump&Return'].includes(serviceAction);

      if (isIncluding && val === undefined) {
        return false;
      }

      return true;
    },
  ),
  callOnWayPhoneNumberId: Yup.number().nullable(),
  textOnWayPhoneNumberId: Yup.number().nullable(),
  notificationApplied: Yup.boolean(),
  notifyDayBefore: Yup.string()
    .nullable()
    .when('notificationApplied', {
      is: true,
      then: Yup.string().required(i18next.t('ValidationErrors.ReminderIsRequired')),
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

          return !!timeFrom && !!timeTo && isTimeAfter(timeFrom, timeTo);
        },
      ),
  }),
  ...billableServiceShape,
  lineItems: Yup.array().of(Yup.object().shape(lineItemShape)),
});

export const generateOrderValidationSchema = (
  { materialStore, billableServiceStore, surchargeStore, i18nStore }: IValidationData,
  t: TFunction,
) =>
  Yup.lazy(values => {
    const {
      pair: { permitRequired, poRequired },
      recurrentTemplateData: { endDate },
      id: recurrentOrderId,
    } = values as INewRecurrentOrder;

    return Yup.object().shape({
      serviceAreaId: Yup.number().required(
        i18next.t(`ValidationErrors.IsRequired`, { fieldName: i18next.t(`Text.ServiceArea`) }),
      ),
      jobSiteId: Yup.number().required(i18next.t('ValidationErrors.JobSiteIsRequired')),
      customerId: Yup.number().required(i18next.t('ValidationErrors.CustomerIsRequired')),
      jobSiteContactId: Yup.number().test(
        'required',
        i18next.t('ValidationErrors.JobSiteContactIsRequired'),
        (id?: Maybe<number>) => !!id,
      ),
      pair: Yup.object().shape({
        poRequired: Yup.boolean(),
        permitRequired: Yup.boolean(),
        popupNote: Yup.string()
          .max(256, i18next.t('ValidationErrors.PleaseEnterUpTo256characters'))
          .nullable(),
      }),
      promoApplied: Yup.boolean(),
      promoId: Yup.number()
        .nullable()
        .when('promoApplied', {
          is: true,
          then: Yup.number().required(i18next.t('ValidationErrors.PromoIsRequired')),
        }),
      recurrentTemplateData: Yup.object().shape({
        ...getOrderShape(
          {
            materialStore,
            billableServiceStore,
            permitRequired,
            surchargeStore,
            i18nStore,
            poRequired,
          },
          t,
        ),
        frequencyType: Yup.string()
          .oneOf(frequencyTypeOptions, i18next.t('ValidationErrors.InvalidType'))
          .required(i18next.t('ValidationErrors.FrequencyIsRequired')),
        frequencyPeriod: Yup.number().when('frequencyType', {
          is: RecurrentFormFrequencyType.custom,
          then: Yup.number()
            .integer(i18next.t('ValidationErrors.MustInteger'))
            .required(i18next.t('ValidationErrors.FrequencyPeriodIsRequired')),
        }),
        customFrequencyType: Yup.string()
          .nullable()
          .when('frequencyType', {
            is: RecurrentFormFrequencyType.custom,
            then: Yup.string()
              .oneOf(customFrequencyTypes, i18next.t('ValidationErrors.InvalidType'))
              .required(i18next.t('ValidationErrors.CustomFrequencyIsRequired')),
          }),
        frequencyDays: Yup.array()
          .of(Yup.number())
          .when('frequencyType', {
            is: RecurrentFormFrequencyType.custom,
            then: Yup.array()
              .of(Yup.number())
              .when('customFrequencyType', {
                is: RecurrentFormCustomFrequencyType.weekly,
                then: Yup.array()
                  .of(Yup.number().integer(i18next.t('ValidationErrors.InvalidType')))
                  .required(i18next.t('ValidationErrors.WeeksFrequencyIsRequired')),
                otherwise: Yup.array()
                  .of(Yup.number())
                  .when('customFrequencyType', {
                    is: RecurrentFormCustomFrequencyType.monthly,
                    then: Yup.array()
                      .of(Yup.number().integer(i18next.t('ValidationErrors.InvalidType')))
                      .min(1, i18next.t('ValidationErrors.MonthlyFrequencyIsRequired'))
                      .required(i18next.t('ValidationErrors.MonthlyFrequencyIsRequired')),
                  }),
              }),
          }),
        startDate: Yup.date()
          .required(i18next.t('ValidationErrors.StartDateIsRequired'))
          .test(
            'isNotBefore',
            i18next.t('ValidationErrors.MustNotBeLessThanToday'),
            (date?: Maybe<Date>) =>
              !!recurrentOrderId || (!!date && !isBefore(startOfDay(date), startOfDay(new Date()))),
          ),
        endDate: Yup.date()
          .test(
            'isNotBefore',
            i18next.t('ValidationErrors.MustNotBeLessStartDate'),
            function (date?: Maybe<Date>) {
              if (!date) {
                return true;
              }

              return (
                !!date && !isBefore(startOfDay(date), startOfDay(this.parent.startDate as Date))
              );
            },
          )
          .test(
            'isPeriodLessThanOneDay',
            i18next.t('ValidationErrors.EndDateShouldBeAtLeast2DayLaterThanStartDate'),
            function (date?: Maybe<Date>) {
              if (!date) {
                return true;
              }

              return !!date && differenceInCalendarDays(date, this.parent.startDate as Date) > 1;
            },
          ),
      }),
      delivery: Yup.object().when('isDeliveryApplied', {
        is: true,
        then: Yup.object().shape({
          ...getOrderShape(
            {
              materialStore,
              billableServiceStore,
              permitRequired,
              surchargeStore,
              i18nStore,
              poRequired,
            },
            t,
          ),
          serviceDate: Yup.date()
            .required(i18next.t('ValidationErrors.ServiceDateIsRequired'))
            .test(
              'isNotBefore',
              i18next.t('ValidationErrors.MustNotBeLessThanToday'),
              (date?: Maybe<Date>) => !!date && !isBefore(startOfDay(date), startOfDay(new Date())),
            ),
        }),
      }),
      final: Yup.object().when('isFinalApplied', {
        is: true,
        then: Yup.object().shape({
          ...getOrderShape(
            {
              materialStore,
              billableServiceStore,
              permitRequired,
              surchargeStore,
              i18nStore,
              poRequired,
            },
            t,
          ),
          serviceDate: Yup.date()
            .required(i18next.t('ValidationErrors.ServiceDateIsRequired'))
            .test(
              'isNotBefore',
              i18next.t('ValidationErrors.MustNotBeLessThanToday'),
              (date?: Maybe<Date>) => !!date && !isBefore(startOfDay(date), startOfDay(new Date())),
            )
            .test(
              'notValid',
              i18next.t('ValidationErrors.FinalOrderCannotBeCreated'),
              (date?: Maybe<Date>) => !!date && !!endDate,
            ),
        }),
      }),
    });
  });

const today = new Date();

export const defaultFinalOrDeliveryOrderValue: INewOrderFormData = {
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
  purchaseOrder: undefined,
  purchaseOrderId: undefined,
  isOneTimePO: false,
  oneTimePurchaseOrderNumber: '',
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
  applySurcharges: true,
};

const getDefaultRecurrentOrderValue = (
  applySurcharges: boolean,
  purchaseOrderId?: number,
): INewRecurrentOrderFormData & IOrderSummarySection => ({
  promoApplied: false,
  noBillableService: false,
  someoneOnSite: false,
  toRoll: false,
  highPriority: false,
  earlyPick: false,
  orderContactId: 0,
  billableServiceId: undefined,
  materialId: undefined,
  billableServicePrice: undefined,
  billableServiceQuantity: 1,
  globalRatesServicesId: undefined,
  customRatesGroupServicesId: undefined,
  equipmentItemsMaterialsOptions: [],
  startDate: today,
  endDate: undefined,
  frequencyType: undefined,
  frequencyPeriod: undefined,
  customFrequencyType: undefined,
  frequencyDays: [],
  callOnWayPhoneNumber: undefined,
  callOnWayPhoneNumberId: undefined,
  textOnWayPhoneNumber: undefined,
  textOnWayPhoneNumberId: undefined,
  lineItems: [],
  driverInstructions: undefined,
  permitId: undefined,
  purchaseOrder: undefined,
  purchaseOrderId,
  isOneTimePO: false,
  oneTimePurchaseOrderNumber: '',
  bestTimeToCome: 'any',
  bestTimeToComeFrom: null,
  bestTimeToComeTo: null,
  disposalSiteId: undefined,
  notifyDayBefore: null,
  notificationApplied: false,
  equipmentItemId: undefined,
  thirdPartyHaulerId: undefined,
  customRatesGroupId: 0,
  selectedGroup: null,
  grandTotal: 0,
  unlockOverrides: false,
  promoId: null,
  applySurcharges,
});

export const getRecurrentOrderValue = (
  applySurcharges: boolean,
  purchaseOrderId?: number,
): INewRecurrentOrder => ({
  type: ClientRequestType.Unknown,
  searchString: '',
  businessUnitId: '',
  businessLineId: '',
  customerId: 0,
  jobSiteId: 0,
  customerJobSiteId: undefined,
  jobSiteContactId: 0,
  projectId: undefined,
  pair: {
    poRequired: false,
    permitRequired: false,
    signatureRequired: false,
    cabOver: false,
    alleyPlacement: false,
    popupNote: '',
    workOrderNote: '',
  },
  payment: {
    paymentMethod: 'onAccount',
    amount: 0,
    sendReceipt: false,
    authorizeCard: false,
    isAch: false,
  },
  overrideCreditLimit: false,
  commercialTaxesUsed: true,
  recurrentTemplateData: getDefaultRecurrentOrderValue(applySurcharges, purchaseOrderId),
  delivery: undefined,
  final: undefined,
  isDeliveryApplied: false,
  isFinalApplied: false,
  applySurcharges,
});
