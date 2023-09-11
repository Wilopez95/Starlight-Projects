import { determinePartOfDay } from '@root/components/OrderTimePicker/helpers';
import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';
import { IConfigurableSubscriptionOrder, SubscriptionOrderStatusEnum } from '@root/types';

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
  unapprovedComment: '',
  unfinalizedComment: '',
  lineItems: [],
  overrideCreditLimit: false,
  isOneTimePO: false,
  oneTimePurchaseOrderNumber: '',
  applySurcharges: false,
  surcharges: [],
  subscriptionOrderOptions: [],
};

export const getValues = (
  order: SubscriptionOrder | null,
  subscription: Subscription | null,
): IConfigurableSubscriptionOrder => {
  if (order && subscription) {
    return {
      id: order.id,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      businessLineId: subscription.businessLine.id,
      jobSiteId: order.jobSite?.originalId ?? order.jobSite?.id ?? null,
      customerId: subscription.customer.originalId,
      serviceDate: order.serviceDate,
      quantity: order.quantity,
      callOnWayPhoneNumber: order.callOnWayPhoneNumber,
      textOnWayPhoneNumber: order.textOnWayPhoneNumber,
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
      toRoll: order.toRoll,

      subscriptionContactId: order.subscriptionContact?.originalId ?? order.subscriptionContactId,
      jobSiteContactId: order.jobSiteContact?.originalId ?? order.jobSiteContactId,
      promoId: order.promoId,
      grandTotal: order.grandTotal,

      globalRatesServicesId: order.globalRatesServicesId,
      customRatesGroupServicesId: order.customRatesGroupServicesId,
      price: order.price,
      purchaseOrder: order.purchaseOrder,
      purchaseOrderId: order.purchaseOrder?.id,
      isOneTimePO: order.purchaseOrder?.isOneTime ?? false,
      oneTimePurchaseOrderNumber: order.purchaseOrder?.isOneTime
        ? order.purchaseOrder?.poNumber
        : undefined,
      permitId: order.permit?.originalId,
      thirdPartyHaulerId: order.thirdPartyHaulerId,
      unlockOverrides: false,
      overrideCreditLimit: false,

      billableServiceId: order.billableService.originalId ?? order.billableServiceId,
      equipmentItemId: order.billableService.equipmentItemId,
      materialId: order.material?.originalId,
      lineItems: order.lineItems,
      status: order.status,
      billableLineItemsTotal: order.billableLineItemsTotal,
      unapprovedComment: order.unapprovedComment,
      unfinalizedComment: order.unfinalizedComment,
      applySurcharges: false,
      surcharges: [],
      subscriptionOrderOptions: order.subscriptionOrderOptions,
    };
  }

  return defaultValues;
};
