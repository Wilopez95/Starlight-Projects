import { getHours, getMinutes, set } from 'date-fns';
import i18next from 'i18next';
import * as Yup from 'yup';

import { BillableItemActionEnum } from '@root/consts';
import { addressFormat } from '@root/helpers';
import { IGetValidationSchema } from '@root/quickViews/helpers/types';
import { Subscription } from '@root/stores/subscription/Subscription';
import {
  IConfigurableSubscriptionOrder,
  ISubscriptionOrder,
  SubscriptionOrderStatusEnum,
} from '@root/types';

const I18N_PATH = 'quickViews.SubscriptionOrderDetails.ValidationErrors.';

// TODO: remove defaultValues for edit-only form
export const defaultValues: IConfigurableSubscriptionOrder = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  businessLineId: 0,
  jobSiteId: null,
  customerId: 0,
  serviceDate: new Date(),
  callOnWayPhoneNumber: null,
  textOnWayPhoneNumber: null,
  alleyPlacement: false,
  jobSiteNote: null,
  jobSiteContactId: 0,
  jobSiteContactTextOnly: false,
  poRequired: false,
  permitRequired: false,
  signatureRequired: false,
  unapprovedComment: '',
  unfinalizedComment: '',
  bestTimeToComeFrom: '',
  bestTimeToComeTo: '',
  highPriority: false,
  earlyPick: false,
  someoneOnSite: false,
  toRoll: false,
  subscriptionContactId: 0,
  promoId: null,
  grandTotal: null,
  instructionsForDriver: null,
  status: SubscriptionOrderStatusEnum.scheduled,
  billableLineItemsTotal: 0,
  lineItems: [],
  overrideCreditLimit: false,
  isOneTimePO: false,
  surcharges: [],
  applySurcharges: false,
  subscriptionOrderOptions: [],
};

export const getInitialValues = (
  subscriptionOrder: ISubscriptionOrder,
  subscription: Subscription,
): IConfigurableSubscriptionOrder => {
  const { completedAt } = subscriptionOrder;

  const minutes = completedAt ? getMinutes(completedAt) : 0;
  const hours = completedAt ? getHours(completedAt) : 0;

  const completionDate = completedAt ?? undefined;
  const completionTime = !minutes && !hours ? undefined : set(new Date(), { hours, minutes });

  return {
    id: subscriptionOrder.id,
    noBillableService:
      !subscriptionOrder.billableService ||
      subscriptionOrder.billableService?.action === BillableItemActionEnum.nonService,
    businessLineId: subscription.businessLine.id,
    customerId: subscription.customer.id,
    jobSiteId: subscriptionOrder.jobSite?.originalId ?? subscriptionOrder.jobSite?.id ?? null,
    updatedAt: subscriptionOrder.updatedAt,
    createdAt: subscriptionOrder.createdAt,
    status: subscriptionOrder.status,
    grandTotal: subscriptionOrder.grandTotal,
    billableLineItemsTotal: subscriptionOrder.billableLineItemsTotal,
    billableServiceId: subscriptionOrder.billableService.originalId,
    serviceDate: subscriptionOrder.serviceDate,
    instructionsForDriver: subscriptionOrder.instructionsForDriver ?? '',
    callOnWayPhoneNumber: subscriptionOrder.callOnWayPhoneNumber,
    textOnWayPhoneNumber: subscriptionOrder.textOnWayPhoneNumber,
    customerName: subscriptionOrder.customer?.name ?? '',
    jobSiteAddress: addressFormat(subscriptionOrder.jobSite!.address),
    materialId: subscriptionOrder.subscriptionServiceItem.material?.originalId,
    promoId: subscriptionOrder.promoId,
    lineItems: subscriptionOrder.lineItems,
    newLineItems: [],
    bestTimeToComeFrom: subscriptionOrder.bestTimeToComeFrom,
    bestTimeToComeTo: subscriptionOrder.bestTimeToComeTo,
    someoneOnSite: subscriptionOrder.someoneOnSite,
    toRoll: subscriptionOrder.toRoll,
    poRequired: subscriptionOrder.poRequired,
    permitRequired: subscriptionOrder.permitRequired,
    signatureRequired: subscriptionOrder.signatureRequired,
    alleyPlacement: subscriptionOrder.alleyPlacement ?? false,
    jobSiteNote: subscriptionOrder.jobSiteNote,
    highPriority: subscriptionOrder.highPriority,
    earlyPick: subscriptionOrder.earlyPick,
    globalRatesServicesId: subscriptionOrder.globalRatesServicesId,
    customRatesGroupServicesId: subscriptionOrder.customRatesGroupServicesId,
    subscriptionContactId: subscriptionOrder.subscriptionContactId,
    quantity: subscriptionOrder.quantity,
    price: subscriptionOrder.price,
    equipmentItemId: subscriptionOrder.billableService.equipmentItemId,
    jobSiteContactId: subscriptionOrder.jobSiteContactId,
    purchaseOrder: subscriptionOrder.purchaseOrder,
    purchaseOrderId: subscriptionOrder.purchaseOrder?.id,
    isOneTimePO: subscriptionOrder.purchaseOrder?.isOneTime ?? false,
    oneTimePurchaseOrderNumber: subscriptionOrder.purchaseOrder?.isOneTime
      ? subscriptionOrder.purchaseOrder?.poNumber
      : undefined,
    jobSiteContactTextOnly: subscriptionOrder.jobSiteContactTextOnly,
    customRatesGroupId: subscriptionOrder.customRatesGroup?.originalId ?? 0,
    invoiceNotes: subscriptionOrder.invoiceNotes ?? '',
    thirdPartyHaulerId: subscriptionOrder.thirdPartyHaulerId,
    assignedRoute: subscriptionOrder.assignedRoutes?.join(', ') ?? '',
    billableService: subscriptionOrder.billableService,
    truck: subscriptionOrder.truckNumbers?.join(', ') ?? '',
    droppedEquipmentItem: subscriptionOrder.droppedEquipmentItems?.join(', ') ?? '',
    pickedUpEquipmentItem: subscriptionOrder.pickedUpEquipmentItems?.join(', ') ?? '',
    weight: subscriptionOrder.weight,
    weightUnit: subscriptionOrder.weightUnit ?? 'none',
    startedAt: subscriptionOrder.startedAt ?? undefined,
    arrivedAt: subscriptionOrder.arrivedAt,
    startServiceDate: subscriptionOrder.startServiceDate,
    finishWorkOrderDate: subscriptionOrder.finishWorkOrderDate,
    completionDate,
    completionTime,
    mediaFiles: subscriptionOrder.mediaFiles,
    taxDistricts: [],
    unlockOverrides: false,
    unapprovedComment: subscriptionOrder.unapprovedComment,
    unfinalizedComment: subscriptionOrder.unfinalizedComment,
    overrideCreditLimit: false,
    surcharges: [],
    applySurcharges: false,
    subscriptionOrderOptions: subscriptionOrder.subscriptionOrderOptions,
  };
};

const lineItemsValidationObject = {
  lineItems: Yup.array().of(
    Yup.object().shape({
      billableLineItemId: Yup.number().required(i18next.t(`${I18N_PATH}LineItemRequired`)),
      price: Yup.number()
        .positive(i18next.t(`${I18N_PATH}PriceGreaterZero`))
        .required(i18next.t(`${I18N_PATH}PriceRequired`)),
      quantity: Yup.number()
        .integer(i18next.t(`${I18N_PATH}QuantityInteger`))
        .positive(i18next.t(`${I18N_PATH}QuantityGreaterZero`))
        .required(i18next.t(`${I18N_PATH}QuantityRequired`)),
    }),
  ),
};

const defaultValidationObject = {
  route: Yup.string(),
  truck: Yup.string().typeError(i18next.t(`${I18N_PATH}TruckNumber`)),
  droppedEquipmentItem: Yup.string()
    .typeError(i18next.t(`${I18N_PATH}DroppedEquipmentNumber`))
    .nullable(),
  pickedUpEquipmentItem: Yup.string()
    .typeError(i18next.t(`${I18N_PATH}PickedUpEquipmentNumber`))
    .nullable(),
  startedAt: Yup.date(),
  arrivedAt: Yup.date(),
  startServiceDate: Yup.date(),
  finishWorkOrderDate: Yup.date(),
  completionDate: Yup.date(),
  completionTime: Yup.date(),
  instructionsForDriver: Yup.string(),
  invoiceNotes: Yup.string(),
  ...lineItemsValidationObject,
};

const defaultValidationSchema = Yup.object().shape({
  ...defaultValidationObject,
});

const extendedValidationSchema = Yup.object().shape({
  ...defaultValidationObject,
  weight: Yup.number()
    .typeError(i18next.t(`${I18N_PATH}WeightNumber`))
    .positive(i18next.t(`${I18N_PATH}WeightGreaterZero`)),
  weightUnit: Yup.string().oneOf(['none', 'yards', 'tons']),
});

export const noBillableServiceValidationSchema = Yup.object().shape({
  instructionsForDriver: Yup.string(),
  invoiceNotes: Yup.string(),
  ...lineItemsValidationObject,
});

export const getValidationSchema = ({
  billableItemAction,
  thirdPartyHaulerId,
}: IGetValidationSchema) => {
  if (
    !billableItemAction ||
    billableItemAction === BillableItemActionEnum.none ||
    billableItemAction === BillableItemActionEnum.nonService ||
    thirdPartyHaulerId
  ) {
    return noBillableServiceValidationSchema;
  }
  const isExtended = [BillableItemActionEnum.reposition, BillableItemActionEnum.relocate].includes(
    billableItemAction,
  );

  return isExtended ? extendedValidationSchema : defaultValidationSchema;
};
