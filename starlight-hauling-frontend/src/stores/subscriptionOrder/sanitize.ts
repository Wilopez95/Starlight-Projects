import { format, getHours, getMinutes, set } from 'date-fns';

import { IRevertStatusForm } from '@root/components/forms/RevertOrderStatus/types';
import { filterMediaFiles, formatTime } from '@root/helpers';
import { Regions } from '@root/i18n/config/region';
import { IDateTimeFormatComponents } from '@root/i18n/types';
import { getOrderTotal } from '@root/pages/NewRequest/NewRequestForm/forms/Order/helpers';
import {
  INewSubscriptionOrders,
  ISubscriptionOrderLineItem,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  IConfigurableSubscriptionOrder,
  IEntity,
  IRevertCompletedStatus,
  ITransitionSubscriptionOrderStatus,
  ScheduledOrInProgress,
  SubscriptionOrderStatusEnum,
} from '@root/types';

export const mapNewSubscriptionOrderRequest = (
  ordersData: INewSubscriptionOrders,
  region: Regions,
): [Omit<IConfigurableSubscriptionOrder, keyof IEntity>, number] => {
  const { subscriptionId } = ordersData;

  const order = ordersData.orders[0];
  const { bestTimeToComeFrom, bestTimeToComeTo } = formatTime(order);

  return [
    {
      businessLineId: +ordersData.businessLineId,
      customerId: ordersData.customerId,
      jobSiteId: ordersData.jobSiteId,
      assignedRoute: order.route,
      serviceDate: order.serviceDate,
      globalRatesServicesId: order.globalRatesServicesId ?? null,
      customRatesGroupId: order.customRatesGroupId,
      price: order.billableServicePrice,
      quantity: order.billableServiceQuantity,
      materialId: order.materialId,
      callOnWayPhoneNumber: order.callOnWayPhoneNumber ?? null,
      textOnWayPhoneNumber: order.textOnWayPhoneNumber ?? null,
      alleyPlacement: ordersData.alleyPlacement,

      jobSiteNote: ordersData.popupNote,
      jobSiteContactId: ordersData.jobSiteContactId,
      jobSiteContactTextOnly: false,
      destinationJobSiteId: order.jobSite2Id,
      instructionsForDriver: order.driverInstructions ?? null,
      purchaseOrder: order.purchaseOrder,
      purchaseOrderId: order.purchaseOrderId,
      isOneTimePO: order.isOneTimePO ?? false,
      oneTimePurchaseOrderNumber: order.isOneTimePO ? order.oneTimePurchaseOrderNumber : undefined,
      permitId: order.permitId,
      poRequired: ordersData.poRequired,
      permitRequired: ordersData.permitRequired,
      signatureRequired: ordersData.signatureRequired,
      bestTimeToComeFrom,
      bestTimeToComeTo,

      highPriority: order.highPriority,
      earlyPick: order.earlyPick,
      someoneOnSite: order.someoneOnSite,
      toRoll: order.toRoll,

      thirdPartyHaulerId: order.thirdPartyHaulerId,
      subscriptionContactId: order.orderContactId,

      unlockOverrides: ordersData.unlockOverrides,

      promoId: ordersData.promoId ?? null,
      grandTotal: getOrderTotal({
        order,
        businessLineId: ordersData.businessLineId,
        region,
        commercialTaxesUsed: true,
      }),
      overrideCreditLimit: ordersData.overrideCreditLimit,
      surcharges: ordersData.surcharges ?? [],

      billableServiceId: order.billableServiceId,
      lineItems: order.lineItems.map(lineItem => ({
        ...lineItem,
        id: 0,
        units: undefined,
        unlockOverrides: false,
      })),
      status: ordersData.status,
      unapprovedComment: null,
      unfinalizedComment: null,
      droppedEquipmentItem: order.droppedEquipmentItemCode,
      pickedUpEquipmentItem: order.pickedUpEquipmentItemCode,
      applySurcharges: ordersData.applySurcharges,
      subscriptionOrderOptions: ordersData.subscriptionOrderOptions,
    },
    subscriptionId,
  ];
};

export const sanitizeSubscriptionOrder = (
  subscriptionOrderData: IConfigurableSubscriptionOrder,
): IConfigurableSubscriptionOrder => {
  const { bestTimeToComeFrom, bestTimeToComeTo } = formatTime(subscriptionOrderData);

  return {
    ...subscriptionOrderData,
    grandTotal: subscriptionOrderData.grandTotal ?? null,
    promoId: subscriptionOrderData.promoId ?? null,
    oneTimePurchaseOrderNumber: subscriptionOrderData.isOneTimePO
      ? subscriptionOrderData.oneTimePurchaseOrderNumber
      : null,
    destinationJobSiteId: subscriptionOrderData.destinationJobSiteId,
    bestTimeToComeFrom,
    bestTimeToComeTo,
  };
};

const mapLineItems = (lineItems: ISubscriptionOrderLineItem[]) =>
  lineItems.map(lineItem => ({
    ...lineItem,
    ...(lineItem.historicalLineItem?.originalId && {
      billableLineItemId: lineItem.historicalLineItem.originalId,
    }),
    materialId: lineItem.materialId ?? null,
    customRatesGroupLineItemsId: lineItem.customRatesGroupLineItemsId ?? null,
  }));

const getCompletedAt = (completionDate?: Date, completionTime?: Date) => {
  if (!completionDate) {
    return null;
  }
  const minutes = completionTime ? getMinutes(completionTime) : 0;
  const hours = completionTime ? getHours(completionTime) : 0;

  return set(completionDate, { hours, minutes });
};

export const mapCompletedSubscriptionOrder = (
  subscriptionOrder: IConfigurableSubscriptionOrder,
  { ISO }: IDateTimeFormatComponents,
): ITransitionSubscriptionOrderStatus => {
  const [mediaFiles, blobs] = filterMediaFiles(subscriptionOrder.mediaFiles);

  const completedAt = getCompletedAt(
    subscriptionOrder.completionDate,
    subscriptionOrder.completionTime,
  );

  return {
    noBillableService: subscriptionOrder.noBillableService,
    action: subscriptionOrder.billableService?.action,
    materialId: subscriptionOrder.materialId,
    promoId: subscriptionOrder.promoId,
    instructionsForDriver: subscriptionOrder.instructionsForDriver ?? null,
    invoiceNotes: subscriptionOrder.invoiceNotes ?? null,
    billableServiceId: subscriptionOrder.billableServiceId,
    ...(!subscriptionOrder.noBillableService && {
      completionFields: {
        completedAt: completedAt ? format(completedAt, ISO) : null,
        route: subscriptionOrder.assignedRoute ?? null,
        truck: subscriptionOrder.truck ?? null,
        droppedEquipmentItem: subscriptionOrder.droppedEquipmentItem ?? null,
        pickedUpEquipmentItem: subscriptionOrder.pickedUpEquipmentItem ?? null,
        weight: subscriptionOrder.weight ?? null,
        weightUnit:
          !subscriptionOrder.weightUnit || subscriptionOrder.weightUnit === 'none'
            ? null
            : subscriptionOrder.weightUnit,
        startedAt: subscriptionOrder.startedAt ? format(subscriptionOrder.startedAt, ISO) : null,
        arrivedAt: subscriptionOrder.arrivedAt ? format(subscriptionOrder.arrivedAt, ISO) : null,
        startServiceDate: subscriptionOrder.startServiceDate
          ? format(subscriptionOrder.startServiceDate, ISO)
          : null,
        finishWorkOrderDate: subscriptionOrder.finishWorkOrderDate
          ? format(subscriptionOrder.finishWorkOrderDate, ISO)
          : null,
        mediaFiles,
      },
    }),
    lineItems: [
      ...mapLineItems(subscriptionOrder.lineItems ?? []),
      ...mapLineItems(subscriptionOrder.newLineItems ?? []),
    ],
    images: blobs,
    grandTotal: subscriptionOrder.grandTotal,
    overrideCreditLimit: subscriptionOrder.overrideCreditLimit,
  };
};

const statuses = {
  scheduled: SubscriptionOrderStatusEnum.scheduled,
  inProgress: SubscriptionOrderStatusEnum.inProgress,
};

export const mapUncompleteData = (data: IRevertStatusForm): IRevertCompletedStatus => {
  const status = data.status as ScheduledOrInProgress;

  return {
    comment: data.comment,
    status: statuses[status],
  };
};
