/* eslint-disable complexity */ //disabled because it will need a huge refactor
import {
  differenceInCalendarDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';
import i18next, { TFunction } from 'i18next';
import { isDate } from 'lodash-es';
import validator from 'validator';
import * as Yup from 'yup';

import { determinePartOfDay, isTimeAfter } from '@root/components/OrderTimePicker/helpers';
import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import {
  BillableItemActionEnum,
  BusinessLineType,
  defaultReminderSchedule,
  ONLY_NUMBERS_AND_LETTERS,
  WorkOrderStatus,
} from '@root/consts';
import { addressFormat, priceValidator } from '@root/helpers';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { IntlConfig } from '@root/i18n/types';
import { PaymentStatus } from '@root/modules/billing/types';
import { type BillableServiceStore } from '@root/stores/billableService/BillableServiceStore';
import { type MaterialStore } from '@root/stores/material/MaterialStore';
import { IConfigurableOrder, IOrder, Maybe, ReminderTypes } from '@root/types';

const materialProfileList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.liveLoad,
];

const today = startOfDay(new Date());

export const getData = (order: IOrder): IConfigurableOrder => {
  if (!order) {
    return {} as IConfigurableOrder;
  }

  const { workOrder } = order;
  const defaultDate = order.businessLine.type === BusinessLineType.rollOff ? today : undefined;

  return {
    id: order.id,
    businessUnit: order.businessUnit,
    businessLine: order.businessLine,
    updatedAt: order.updatedAt,
    createdAt: order.createdAt,
    status: order.status,
    jobSiteId: order.jobSite.originalId,
    customerId: order.customer.originalId,
    customerJobSiteId: order.customerJobSite?.originalId ?? null,
    grandTotal: order.grandTotal,
    billableServiceId: order.billableService?.originalId ?? null,
    billableServiceQuantity: 1,
    billableServiceApplySurcharges: !!order.billableService?.applySurcharges,
    serviceDate: order.serviceDate,
    popupNote: order.customerJobSite?.popupNote ?? '',
    driverInstructions: order.driverInstructions,
    disposalSiteId: order.disposalSite?.originalId ?? null,
    billableServiceTotal: order.billableServiceTotal,
    billableLineItemsTotal: order.billableLineItemsTotal,
    callOnWayPhoneNumber: order.callOnWayPhoneNumber,
    callOnWayPhoneNumberId: order.callOnWayPhoneNumberId,
    textOnWayPhoneNumber: order.textOnWayPhoneNumber,
    textOnWayPhoneNumberId: order.textOnWayPhoneNumberId,
    customerName: order.customer.name ?? '',
    jobSiteAddress: addressFormat(order.jobSite.address),
    jobSite2Address: order.jobSite2 ? addressFormat(order.jobSite2?.address) : '',
    materialId: order.material?.originalId ?? null,
    projectId: order.project?.originalId ?? null,
    promoId: order.promo?.originalId ?? null,
    lineItems: (order.lineItems ?? []).map(lineItem => ({
      ...lineItem,
      materialId: lineItem.material?.originalId ?? null,
      billableLineItemId: lineItem?.billableLineItem?.originalId ?? null,
      globalRatesLineItemsId: lineItem.globalRatesLineItem?.originalId,
      customRatesGroupLineItemsId: lineItem.customRatesGroupLineItem?.originalId,
    })),
    billableServicePrice: order.billableServicePrice ?? null,
    initialGrandTotal: order.initialGrandTotal ?? null,
    thresholds: (order.thresholds ?? []).map(threshold => ({
      ...threshold,
      thresholdId: threshold.threshold.originalId,
      globalRatesThresholdId: threshold.globalRatesThreshold.originalId,
    })),
    bestTimeToComeFrom: order.bestTimeToComeFrom,
    bestTimeToComeTo: order.bestTimeToComeTo,
    rescheduleComment: order.rescheduleComment ?? null,
    someoneOnSite: order.someoneOnSite,
    toRoll: order.toRoll,
    signatureRequired: workOrder?.signatureRequired ?? false,
    customerJobSitePairSignatureRequired: order.customerJobSite?.signatureRequired ?? false,
    alleyPlacement: order.alleyPlacement ?? false,
    cabOver: order.cabOver ?? false,
    highPriority: order.highPriority,
    earlyPick: order.earlyPick,
    globalRatesServicesId: order.globalRatesServices?.originalId ?? null,
    customRatesGroupServicesId: order.customRatesGroupServices?.originalId ?? null,
    equipmentItemId: order?.equipmentItem?.originalId ?? null,
    permitId: order.permit?.originalId ?? null,
    poRequired: order.customerJobSite?.poRequired ?? false,
    permitRequired: workOrder?.permitRequired ?? false,
    customerJobSitePairPermitRequired: order.customerJobSite?.permitRequired ?? false,
    jobSiteContactId: order.jobSiteContact?.originalId,
    orderContactId: order.orderContact?.originalId,
    bestTimeToCome: order.bestTimeToComeFrom
      ? determinePartOfDay(order.bestTimeToComeFrom, order.bestTimeToComeTo)
      : 'any',
    jobSite2Id: order.jobSite2?.originalId,
    customRatesGroupId: order.customRatesGroup?.originalId ?? 0,
    materialProfileId:
      order.billableService && materialProfileList.includes(order.billableService?.action)
        ? order.materialProfile?.originalId ?? 0
        : null,
    purchaseOrder: order.purchaseOrder,
    purchaseOrderId: order.purchaseOrder?.id,
    isOneTimePO: order.purchaseOrder?.isOneTime ?? false,
    oneTimePurchaseOrderNumber: order.purchaseOrder?.isOneTime
      ? order.purchaseOrder?.poNumber
      : undefined,
    cancellationReasonType: order.cancellationReasonType,
    cancellationComment: order.cancellationComment,
    unfinalizedComment: order.unfinalizedComment,
    unapprovedComment: order.unapprovedComment,
    invoiceNotes: order.invoiceNotes,
    ticketFile: order.ticketFile,
    thirdPartyHauler: order.thirdPartyHauler,
    thirdPartyHaulerId: order.thirdPartyHauler?.originalId ?? null,
    droppedEquipmentItem: order.droppedEquipmentItem ?? null,
    paymentMethod: order.paymentMethod,
    sendReceipt: order.sendReceipt,
    notifyDayBefore: order.notifyDayBefore,
    serviceArea: order.serviceArea,
    manifestItems: order.manifestItems ?? [],
    newManifestItems: [],
    manifestFiles: [],

    payments:
      order.payments?.map(payment => ({
        paymentId: payment.id,
        amount: payment.amount,
        paymentType: payment.paymentType,
        status: payment.status,
        deferredUntil: payment?.deferredUntil,
        checkNumber: payment?.checkNumber ?? '',
        creditCardId: payment?.creditCardId,
        creditCard: payment?.creditCard,
        orders: payment?.orders,
        isAch: payment?.isAch,
        newCreditCard: {
          id: 0,
          active: true,
          jobSites: null,
          addressLine1: '',
          addressLine2: '',
          cardNickname: '',
          cardNumberLastDigits: '',
          city: '',
          customerId: 0,
          expDate: today,
          nameOnCard: '',
          state: '',
          zip: '',
          cvv: '',
          expirationDate: '',
          expirationMonth: format(today, 'MM'),
          expirationYear: format(today, 'yy'),
          cardNumber: '',
          cardType: 'UNKN',
          isAutopay: false,
        },
      })) ?? [],

    // Historical data
    promo: order.promo,
    orderContact: order.orderContact,
    billableService: order.billableService,
    material: order.material,
    equipmentItem: order.equipmentItem,

    workOrder: {
      id: workOrder?.id,
      woNumber: workOrder?.woNumber?.toString() ?? '',
      route: workOrder?.route ?? '',
      truckId: workOrder?.truckId ?? undefined,
      driverId: workOrder?.driverId ?? undefined,
      droppedEquipmentItem: workOrder?.droppedEquipmentItem ?? '',
      pickedUpEquipmentItem: workOrder?.pickedUpEquipmentItem ?? '',
      weight: workOrder?.weight?.toString() ?? '',
      weightUnit: workOrder?.weightUnit ?? 'tons',
      completionDate: workOrder?.completionDate ?? undefined,
      syncDate: workOrder?.syncDate ?? undefined,
      startWorkOrderDate: workOrder?.startWorkOrderDate ?? defaultDate,
      arriveOnSiteDate: workOrder?.arriveOnSiteDate ?? defaultDate,
      startServiceDate: workOrder?.startServiceDate ?? defaultDate,
      finishServiceDate: workOrder?.finishWorkOrderDate ?? defaultDate,
      ticket: workOrder?.ticket ?? '',
      ticketUrl: workOrder?.ticketUrl ?? '',
      ticketAuthor: workOrder?.ticketAuthor ?? '',
      ticketDate: workOrder?.ticketDate ?? undefined,
      ticketFromCsr: workOrder?.ticketFromCsr ?? false,
      mediaFiles:
        workOrder?.mediaFiles.map(x => ({
          ...x,
          fileName: x.fileName ?? 'unknown',
        })) ?? [],
      driverNotes: workOrder?.driverNotes ?? '',
      status: workOrder?.status ?? WorkOrderStatus.InProgress,
    },
    taxDistricts: order.taxDistricts,
    deferred: order.deferred,
    applySurcharges: order.applySurcharges,
    surcharges: order.surcharges,

    // UI props
    droppedEquipmentItemComment: '',
    droppedEquipmentItemApplied: !!order.droppedEquipmentItem,
    notificationApplied: !!order.notifyDayBefore,
    noBillableService: !order.billableService,
    unlockOverrides: false,
    jobSite2Label: order.jobSite2 ? addressFormat(order.jobSite2?.address) : undefined,
    searchString: '',
    annualReminderConfig: {
      type: ReminderTypes.OrderAnnualEventReminder,
      ...defaultReminderSchedule,
    },
  };
};

const lineItemsValidationObject = {
  lineItems: Yup.array().of(
    Yup.object().shape({
      billableLineItemId: Yup.number().required('Line item is required'),
      price: Yup.number()
        .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
        .min(0, i18next.t(`ValidationErrors.GreaterThanZero`))
        .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
        .required(i18next.t('ValidationErrors.PriceIsRequired')),
      quantity: Yup.number()
        .positive('Quantity must be greater than zero')
        .required('Quantity is required'),
    }),
  ),
  thresholds: Yup.array().of(
    Yup.object().shape({
      price: Yup.number()
        .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
        .min(0, i18next.t(`ValidationErrors.GreaterThanZero`))
        .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
        .required(i18next.t('ValidationErrors.PriceIsRequired')),
      quantity: Yup.number()
        .positive('Quantity must be greater than zero')
        .required('Quantity is required'),
    }),
  ),
};

export const lineItemsValidationSchema = Yup.object().shape(lineItemsValidationObject);

const EditLineItemsShape = Yup.array().of(
  Yup.object().shape({
    billableLineItemId: Yup.number()
      .typeError('Line item must be a number')
      .required('Line item is required'),
    price: Yup.number()
      .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
      .min(0, i18next.t('ValidationErrors.GreaterThanZero'))
      .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
      .required(i18next.t('ValidationErrors.PriceIsRequired')),
    quantity: Yup.number()
      .positive('Quantity must be greater than zero')
      .required('Quantity is required'),
  }),
);

const EditThresholdsItemsShape = Yup.array().of(
  Yup.object().shape({
    price: Yup.number()
      .typeError(i18next.t('ValidationErrors.PriceMustBeANumber'))
      .min(0, i18next.t(`ValidationErrors.GreaterThanZero`))
      .test('price', i18next.t('ValidationErrors.IncorrectPriceFormat'), priceValidator)
      .required(i18next.t('ValidationErrors.PriceIsRequired')),
    quantity: Yup.number()
      .positive('Quantity must be greater than zero')
      .required('Quantity is required'),
  }),
);

interface IValidationData {
  billableServiceStore: BillableServiceStore;
  materialStore: MaterialStore;
}

export const generateEditValidationSchema = (
  { materialStore, billableServiceStore }: IValidationData,
  intl: IntlConfig,
  t: TFunction,
) => {
  return Yup.lazy(values => {
    const { serviceDate, thirdPartyHauler, noBillableService } = values as IConfigurableOrder;

    return Yup.object().shape({
      jobSiteId: Yup.number().required(t(`ValidationErrors.JobSiteIsRequired`)),
      customerId: Yup.number().required(t(`ValidationErrors.CustomerIsRequired`)),
      serviceDate: Yup.date().test(
        'isFutureDate',
        t(`ValidationErrors.MustBeEqualOrLessThanToday`),
        (date?: Maybe<Date>) => {
          if (noBillableService) {
            return !!date && isBefore(date, endOfDay(new Date()));
          }

          return true;
        },
      ),
      jobSiteContactId: Yup.number().when('noBillableService', {
        is: false,
        then: Yup.number()
          .positive(t(`ValidationErrors.JobSiteContactIsRequired`))
          .required(t(`ValidationErrors.JobSiteContactIsRequired`)),
      }),
      orderContactId: Yup.number().when('noBillableService', {
        is: false,
        then: Yup.number().required(t(`ValidationErrors.OrderContactIsRequired`)),
      }),
      thirdPartyHaulerId: Yup.number()
        .nullable()
        .test(
          'required',
          t(`ValidationErrors.ThirdPartyHaulerIsRequired`),
          (val?: Maybe<number>) => {
            if (!val && !!thirdPartyHauler) {
              return false;
            }

            return true;
          },
        ),
      customRatesGroupId: Yup.number()
        .nullable()
        .required(t(`ValidationErrors.PriceGroupIsRequired`)),
      poRequired: Yup.boolean(),
      permitRequired: Yup.boolean(),
      popupNote: Yup.string().max(256, t(`ValidationErrors.PleaseEnterUpTo256characters`)),
      permitId: Yup.number()
        .nullable()
        .when('permitRequired', {
          is: true,
          then: Yup.number().required(t(`ValidationErrors.PermitIsRequired`)),
        }),
      purchaseOrderId: Yup.number().when(['poRequired', 'isOneTimePO'], {
        is: (poRequired, isOneTimePO) => poRequired && !isOneTimePO,
        then: Yup.number().required(t('ValidationErrors.PurchaseOrderNumberIsRequired')),
      }),
      oneTimePurchaseOrderNumber: Yup.string().when(['poRequired', 'isOneTimePO'], {
        is: (poRequired, isOneTimePO) => poRequired && !!isOneTimePO,
        then: Yup.string().required(t('ValidationErrors.PurchaseOrderNumberIsRequired')),
        otherwise: Yup.string(),
      }),
      billableServiceId: Yup.number()
        .nullable()
        .when('noBillableService', {
          is: false,
          then: Yup.number().nullable().required(t(`ValidationErrors.ServiceIsRequired`)),
        }),
      materialId: Yup.number()
        .nullable()
        .when('noBillableService', {
          is: false,
          then: Yup.number().nullable().required(t(`ValidationErrors.MaterialIsRequired`)),
        }),
      materialProfileId: Yup.number()
        .nullable()
        .when('noBillableService', {
          is: false,
          then: Yup.number()
            .nullable()
            .test(
              'required',
              t(`ValidationErrors.MaterialProfileIsRequired`),
              function (val?: Maybe<number>) {
                const billableService = billableServiceStore.getById(
                  this.parent.billableServiceId as string | number | null | undefined,
                );
                const manifested = materialStore.getById(
                  this.parent.materialId as string | number | null | undefined,
                )?.manifested;

                if (
                  manifested &&
                  billableService &&
                  materialProfileList.includes(billableService.action) &&
                  val === undefined
                ) {
                  return false;
                }

                return true;
              },
            ),
        }),
      billableServicePrice: Yup.number().when('noBillableService', {
        is: false,
        then: Yup.number()
          .typeError(t(`ValidationErrors.PriceMustBeANumber`))
          .min(0, t(`ValidationErrors.GreaterThanZero`))
          .test('price', t('ValidationErrors.IncorrectPrice'), priceValidator)
          .required(t(`ValidationErrors.PriceIsRequired`)),
      }),
      jobSite2Id: Yup.number().test(
        'required',
        t(`ValidationErrors.RelocationAddressIsRequired`),
        function (val?: Maybe<number>) {
          const action = billableServiceStore.getById(
            this.parent.billableServiceId as string | number | null | undefined,
          )?.action;

          if (
            action === 'relocate' &&
            this.parent.businessLine.type !== 'portableToilets' &&
            this.parent.status === 'inProgress' &&
            val === undefined
          ) {
            return false;
          }

          return true;
        },
      ),
      disposalSiteId: Yup.number()
        .nullable()
        .test(
          'required',
          t(`ValidationErrors.DisposalSiteIsRequired`),
          function (val?: Maybe<number>) {
            const serviceAction = billableServiceStore.getById(
              this.parent.billableServiceId as string | number | null | undefined,
            )?.action;
            const isIncluding =
              serviceAction &&
              ['final', 'switch', 'liveLoad', 'dump&Return'].includes(serviceAction);

            if (this.parent?.status === 'inProgress') {
              return true;
            }

            if (isIncluding && !val) {
              return false;
            }

            return true;
          },
        ),
      lineItems: EditLineItemsShape.when('noBillableService', {
        is: true,
        then: EditLineItemsShape.min(1, t(`ValidationErrors.AtLeastOneLineItemShouldBeAdded`)),
      }),
      thresholds: EditThresholdsItemsShape,
      callOnWayPhoneNumberId: Yup.string().nullable(),
      textOnWayPhoneNumberId: Yup.string().nullable(),
      promoApplied: Yup.boolean(),
      promoId: Yup.number()
        .nullable()
        .when('promoApplied', {
          is: true,
          then: Yup.number().required(t(`ValidationErrors.PromoIsRequired`)),
        }),
      droppedEquipmentItem: Yup.string()
        .nullable()
        .when('droppedEquipmentItemApplied', {
          is: true,
          then: Yup.string().required(t(`ValidationErrors.AssignedEquipmentIsRequired`)),
        }),
      notifyDayBefore: Yup.string()
        .nullable()
        .when('notificationApplied', {
          is: true,
          then: Yup.string().required(t(`ValidationErrors.ReminderIsRequired`)),
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
                ? format(this.parent.bestTimeToComeFrom as number | Date, dateFormatsEnUS.time24)
                : this.parent.bestTimeToComeFrom;
              const timeTo = isDate(date) ? format(date, dateFormatsEnUS.time24) : (date as string);

              return isTimeAfter(timeFrom, timeTo);
            },
          ),
      }),
      payments: Yup.array().of(
        Yup.object().shape({
          paymentType: Yup.string().required(t(`ValidationErrors.PaymentMethodIsRequired`)),
          creditCardId: Yup.number()
            .nullable()
            .when('paymentType', {
              is: 'creditCard',
              then: Yup.number().required(t(`ValidationErrors.CreditCardIsRequired`)),
            }),
          checkNumber: Yup.string().when('paymentType', {
            is: 'check',
            then: Yup.string()
              .matches(ONLY_NUMBERS_AND_LETTERS, 'Please, use only numbers or letters')
              .required(t(`ValidationErrors.CheckNumberIsRequired`)),
          }),
          status: Yup.string().required(),
          deferredUntil: Yup.date()
            .nullable()
            .test(
              'deferredUntil',
              t(`ValidationErrors.DeferredPaymentDateMustBeBeforeServiceDate`),
              function (date) {
                return !date || !serviceDate || (this.parent.status as PaymentStatus) === 'failed'
                  ? true
                  : differenceInCalendarDays(serviceDate, date) >= 1;
              },
            )
            .test(
              'deferredUntil',
              t(
                `ValidationErrors.PaymentCannotBeDeferredForTodayOrPastPleaseCheckServiceDateOrDeferredDate`,
              ),
              function (date) {
                if ((this.parent.status as PaymentStatus) === 'failed') {
                  return true;
                }

                return !date || isBefore(new Date(), date);
              },
            ),
          // TODO: maybe make creditCardShape more generic & reusable
          newCreditCard: Yup.mixed().when(['paymentType', 'creditCardId'], {
            is: (paymentType: string, creditCardId: number) =>
              paymentType === 'creditCard' && creditCardId === 0,
            then: Yup.object()
              .shape({
                active: Yup.boolean().required(),
                cardNickname: Yup.string(),
                addressLine1: Yup.string()
                  .required(t(`ValidationErrors.AddressLine1IsRequired`))
                  .max(100, t(`ValidationErrors.PleaseEnterUpTo100Characters`)),
                addressLine2: Yup.string()
                  .nullable()
                  .max(100, t(`ValidationErrors.PleaseEnterUpTo100Characters`)),
                city: Yup.string()
                  .required(t(`ValidationErrors.CityIsRequired`))
                  .max(50, t(`ValidationErrors.PleaseEnterUpTo50Characters`)),
                state: Yup.string()
                  .required(t(`ValidationErrors.StateIsRequired`))
                  .max(50, t(`ValidationErrors.PleaseEnterUpTo50Characters`)),
                zip: Yup.string()
                  .matches(intl.zipRegexp, 'ZIP must be in correct format')
                  .required(t(`ValidationErrors.ZipIsRequired`)),
                cvv: Yup.string()
                  .min(3, t(`ValidationErrors.CVVMustBeAtLeast3CharactersLong`))
                  .max(4, t(`ValidationErrors.PleaseEnterUpTo4Characters`))
                  .matches(/\d{3,4}/, t(`ValidationErrors.InvalidCVVType`))
                  .required(t(`ValidationErrors.CVVIsRequired`)),
                cardNumber: Yup.string().test(
                  'cardNumber',
                  t(`ValidationErrors.PleaseEnterAValidCardNumber`),
                  value => {
                    return !!value && validator.isCreditCard(value);
                  },
                ),
                nameOnCard: Yup.string().required(t(`ValidationErrors.NameOnCardIsRequired`)),
                expirationMonth: Yup.string().test(
                  'expirationMonth',
                  t(`ValidationErrors.InvalidExpirationDate`),
                  function (expirationMonth) {
                    if (!expirationMonth) {
                      return false;
                    }

                    const month = +expirationMonth;

                    const now = new Date();

                    now.setMonth(now.getMonth() - 1);

                    return now < new Date(+`20${this.parent.expirationYear as string}`, month - 1);
                  },
                ),
                expirationYear: Yup.string().required('Invalid Expiration Date'),
              })
              .required(),
          }),
        }),
      ),
    });
  });
};

const defaultValidationSchema = Yup.object().shape({
  disposalSiteId: Yup.number().nullable().required('Disposal Site is required'),
  workOrder: Yup.object().shape({
    route: Yup.string(),
    truckId: Yup.string(),
    driverId: Yup.string().required('Driver is required'),
    droppedEquipmentItem: Yup.string()
      .typeError('Dropped Equipment must be a number')
      .required('Dropped Equipment is required'),
    pickedUpEquipmentItem: Yup.string().required('Picked Up Equipment is required'),
    weight: Yup.number()
      .typeError('Weight must be a number')
      .positive('Weight must be greater than zero')
      .required('Weight is required'),
    weightUnit: Yup.string().oneOf(['none', 'yards', 'tons']).required('Weight unit is required'),
    ticket: Yup.string().required('Ticket is required'),
    completionDate: Yup.date().required('Completion Date is Required'),
    startWorkOrderDate: Yup.date().required('Start Work Order Time is Required'),
    arriveOnSiteDate: Yup.date()
      .required('Arrive On Site Time is Required')
      .test(
        'validDate',
        "Must be greater than Start Work Order's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.startWorkOrderDate as number | Date);
        },
      ),
    startServiceDate: Yup.date()
      .required('Start Service Time is Required')
      .test(
        'validDate',
        "Must be greater than Arrive On Site's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.arriveOnSiteDate as number | Date);
        },
      ),
    finishServiceDate: Yup.date()
      .required('Finish Work Order is Required')
      .test(
        'validDate',
        "Must be greater than Start Service Time's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.startServiceDate as number | Date);
        },
      ),
  }),
  ...lineItemsValidationObject,
});

export const deliveryValidationSchema = Yup.object().shape({
  workOrder: Yup.object().shape({
    route: Yup.string(),
    truckId: Yup.string(),
    driverId: Yup.string().required('Driver is required'),
    droppedEquipmentItem: Yup.string()
      .typeError('Dropped Equipment must be a number')
      .required('Dropped Equipment is required'),
    completionDate: Yup.date().required('Completion Date is Required'),
    startWorkOrderDate: Yup.date().required('Start Work Order Time is Required'),
    arriveOnSiteDate: Yup.date()
      .required('Arrive On Site Time is Required')
      .test(
        'validDate',
        "Must be greater than Start Work Order's date",
        function (val?: Maybe<Date>) {
          return !!val && !isBefore(val, this.parent.startWorkOrderDate as number | Date);
        },
      ),
    startServiceDate: Yup.date()
      .required('Start Service Time is Required')
      .test(
        'validDate',
        "Must be greater than Arrive On Site's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.arriveOnSiteDate as number | Date);
        },
      ),
    finishServiceDate: Yup.date()
      .required('Finish Work Order is Required')
      .test(
        'validDate',
        "Must be greater than Start Service Time's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.startServiceDate as number | Date);
        },
      ),
  }),
  ...lineItemsValidationObject,
});

export const finalValidationSchema = Yup.object().shape({
  disposalSiteId: Yup.number().nullable().required('Disposal Site is required'),
  workOrder: Yup.object().shape({
    route: Yup.string(),
    truckId: Yup.string(),
    driverId: Yup.string().required('Driver is required'),
    pickedUpEquipmentItem: Yup.string().required('Picked Up Equipment is required'),
    weight: Yup.number()
      .typeError('Weight must be a number')
      .positive('Weight must be greater than zero')
      .required('Weight is required'),
    weightUnit: Yup.string().oneOf(['none', 'yards', 'tons']).required('Weight unit is required'),
    ticket: Yup.string().required('Ticket is required'),
    completionDate: Yup.date().required('Completion Date is Required'),
    startWorkOrderDate: Yup.date().required('Start Work Order Time is Required'),
    arriveOnSiteDate: Yup.date()
      .required('Arrive On Site Time is Required')
      .test(
        'validDate',
        "Must be greater than Start Work Order's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.startWorkOrderDate as number | Date);
        },
      ),
    startServiceDate: Yup.date()
      .required('Start Service Time is Required')
      .test(
        'validDate',
        "Must be greater than Arrive On Site's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.arriveOnSiteDate as number | Date);
        },
      ),
    finishServiceDate: Yup.date()
      .required('Finish Work Order is Required')
      .test(
        'validDate',
        "Must be greater than Start Service Time's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.startServiceDate as number | Date);
        },
      ),
  }),
  ...lineItemsValidationObject,
});

export const repositionValidationSchema = Yup.object().shape({
  workOrder: Yup.object().shape({
    route: Yup.string(),
    truckId: Yup.string(),
    driverId: Yup.string().required('Driver is required'),
    pickedUpEquipmentItem: Yup.string().required('Picked Up Equipment is required'),

    completionDate: Yup.date().required('Completion Date is Required'),
    startWorkOrderDate: Yup.date().required('Start Work Order Time is Required'),
    arriveOnSiteDate: Yup.date()
      .required('Arrive On Site Time is Required')
      .test(
        'validDate',
        "Must be greater than Start Work Order's date",
        function (val?: Maybe<Date>) {
          return !!val && !isBefore(val, this.parent.startWorkOrderDate as number | Date);
        },
      ),
    startServiceDate: Yup.date()
      .required('Start Service Time is Required')
      .test(
        'validDate',
        "Must be greater than Arrive On Site's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.arriveOnSiteDate as number | Date);
        },
      ),
    finishServiceDate: Yup.date()
      .required('Finish Work Order is Required')
      .test(
        'validDate',
        "Must be greater than Start Service Time's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.startServiceDate as number | Date);
        },
      ),
  }),
  ...lineItemsValidationObject,
});

export const relocateValidationSchema = Yup.object().shape({
  jobSite2Id: Yup.number().test(
    'required',
    'Relocation Address is required',
    function (val?: Maybe<number>) {
      if (this.parent.status === 'inProgress' && !val) {
        return false;
      }

      return true;
    },
  ),
  workOrder: Yup.object().shape({
    route: Yup.string(),
    truckId: Yup.string(),
    driverId: Yup.string().required('Driver is required'),
    pickedUpEquipmentItem: Yup.string().required('Picked Up Equipment is required'),

    completionDate: Yup.date().required('Completion Date is Required'),
    startWorkOrderDate: Yup.date().required('Start Work Order Time is Required'),
    arriveOnSiteDate: Yup.date()
      .required('Arrive On Site Time is Required')
      .test(
        'validDate',
        "Must be greater than Start Work Order's date",
        function (val?: Maybe<Date>) {
          return !!val && !isBefore(val, this.parent.startWorkOrderDate as number | Date);
        },
      ),
    startServiceDate: Yup.date()
      .required('Start Service Time is Required')
      .test(
        'validDate',
        "Must be greater than Arrive On Site's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.arriveOnSiteDate as number | Date);
        },
      ),
    finishServiceDate: Yup.date()
      .required('Finish Work Order is Required')
      .test(
        'validDate',
        "Must be greater than Start Service Time's date",
        function (val?: Maybe<Date>) {
          return !!val && isAfter(val, this.parent.startServiceDate as number | Date);
        },
      ),
  }),
  ...lineItemsValidationObject,
});

export const noBillableServiceValidationSchema = Yup.object().shape({
  ...lineItemsValidationObject,
});

export const portableToiletsValidationSchema = Yup.object().shape({
  workOrder: Yup.object().shape({
    route: Yup.string(),
    truckId: Yup.string(),
    driverId: Yup.string().required('Driver is required'),
    droppedEquipmentItem: Yup.number()
      .typeError('Dropped Equipment must be a number')
      .positive('Dropped Equipment must be greater than zero'),
    completionDate: Yup.date(),
    startWorkOrderDate: Yup.date(),
    arriveOnSiteDate: Yup.date(),
    finishServiceDate: Yup.date(),
    pickedUpEquipmentItem: Yup.string().typeError('Picked Up Equipment must be a number'),
  }),
  ...lineItemsValidationObject,
});

export const getValidationSchema = (order: IOrder) => {
  const billableItemAction = order.billableService?.action;

  if (
    billableItemAction === undefined ||
    billableItemAction === 'none' ||
    order.thirdPartyHauler?.originalId
  ) {
    return noBillableServiceValidationSchema;
  }

  if (order.businessLine.type === BusinessLineType.portableToilets) {
    return portableToiletsValidationSchema;
  }

  switch (billableItemAction) {
    case 'delivery':
      return deliveryValidationSchema;
    case 'final':
      return finalValidationSchema;
    case 'reposition':
      return repositionValidationSchema;
    case 'relocate':
      return relocateValidationSchema;

    default:
      return defaultValidationSchema;
  }
};
