import { determinePartOfDay } from '@root/components/OrderTimePicker/helpers';
import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';
import {
  IConfigurableSubscriptionWorkOrder,
  SubscriptionWorkOrder,
} from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

// TODO: remove defaultValues for edit-only form
export const defaultValues: IConfigurableSubscriptionWorkOrder = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  businessLineId: 0,
  serviceDate: new Date(),
  callOnWayPhoneNumber: '',
  textOnWayPhoneNumber: '',
  alleyPlacement: false,
  jobSiteNote: null,
  jobSiteContactId: 0,
  jobSiteContactTextOnly: '',
  poRequired: false,
  permitRequired: false,
  signatureRequired: false,
  bestTimeToComeFrom: '',
  bestTimeToComeTo: '',
  bestTimeToCome: '',
  highPriority: false,
  earlyPick: false,
  someoneOnSite: false,
  quantity: 1,
  promoId: 0,
  instructionsForDriver: '',
  assignedRoute: '',
  thirdPartyHaulerId: 0,
  permitId: 0,
  purchaseOrder: null,
  subscriptionContactId: 0,
  customRatesGroupServicesId: 0,
  billableServiceId: 0,
  equipmentItemId: 0,
  materialId: 0,
  lineItems: [],
  billableLineItemsTotal: 0,
  droppedEquipmentItem: '',
  pickedUpEquipmentItem: '',
  isOneTimePO: false,
  oneTimePurchaseOrderNumber: '',
};

export const getInitialValues = (
  subscription: Subscription | null,
  subscriptionOrder: SubscriptionOrder,
  order: SubscriptionWorkOrder,
): IConfigurableSubscriptionWorkOrder => {
  return {
    id: order.id,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    businessLineId: subscription?.businessLine.id ?? 0,
    serviceDate: order.serviceDate,
    callOnWayPhoneNumber: order.callOnWayPhoneNumber, // check
    textOnWayPhoneNumber: order.textOnWayPhoneNumber, // check
    alleyPlacement: order.alleyPlacement,
    assignedRoute: order.assignedRoute,

    jobSiteNote: order.jobSiteNote,
    jobSiteContactTextOnly: order.jobSiteContactTextOnly,
    poRequired: order.poRequired,
    permitRequired: order.permitRequired,
    signatureRequired: order.signatureRequired,
    bestTimeToComeFrom: order.bestTimeToComeFrom,
    bestTimeToComeTo: order.bestTimeToComeTo,
    bestTimeToCome: order.bestTimeToComeFrom
      ? determinePartOfDay(order.bestTimeToComeFrom, order.bestTimeToComeTo)
      : 'any',
    instructionsForDriver: order.instructionsForDriver,

    highPriority: order.highPriority,
    earlyPick: order.earlyPick,
    someoneOnSite: order.someoneOnSite,
    promoId: order.promoId,

    jobSiteContactId:
      subscription?.jobSiteContact?.originalId ?? subscriptionOrder.jobSiteContactId,

    customRatesGroupServicesId: order.customRatesGroupServicesId ?? 0,

    quantity: subscriptionOrder.quantity,
    purchaseOrder: subscriptionOrder.purchaseOrder,
    purchaseOrderId: subscriptionOrder.purchaseOrder?.id,
    isOneTimePO: subscriptionOrder.purchaseOrder?.isOneTime ?? false,
    oneTimePurchaseOrderNumber: subscriptionOrder.purchaseOrder?.isOneTime
      ? subscriptionOrder.purchaseOrder?.poNumber
      : undefined,
    permitId: subscriptionOrder.permitId,
    thirdPartyHaulerId: order.thirdPartyHaulerId,
    subscriptionContactId:
      (subscriptionOrder?.subscriptionContact?.originalId ?? 0) ||
      (subscriptionOrder?.subscriptionContact?.id ?? 0),

    billableServiceId:
      subscriptionOrder.subscriptionServiceItem.billableService.originalId ??
      subscriptionOrder.billableServiceId,
    equipmentItemId:
      subscriptionOrder.subscriptionServiceItem.billableService.equipmentItemId ??
      subscriptionOrder.billableService.equipmentItemId,
    materialId: subscriptionOrder.subscriptionServiceItem.material?.id ?? 0,
    subscriptionServiceItem: order.subscriptionServiceItem,
    lineItems: order.lineItems,
    billableLineItemsTotal: order.billableLineItemsTotal,
    droppedEquipmentItem: order.droppedEquipmentItem,
    pickedUpEquipmentItem: order.pickedUpEquipmentItem,
  };
};
