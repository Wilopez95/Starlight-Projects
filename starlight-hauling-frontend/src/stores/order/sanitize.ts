import { format } from 'date-fns';
import { pick } from 'lodash-es';

import { BusinessLineType } from '@root/consts';
import { filterMediaFiles, formatTime } from '@root/helpers';
import { Regions } from '@root/i18n/config/region';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { sanitizeCreditCard } from '@root/modules/billing/CreditCards/store/sanitize';
import { getOrderTotal } from '@root/pages/NewRequest/NewRequestForm/forms/Order/helpers';
import { INewOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';
import {
  IMapCompletedOrder,
  IMapCompletedOrderWorkOrder,
  IMapLineItems,
  type IConfigurableOrder,
  type IProcessedOrderLineItem,
  type ISurcharge,
} from '@root/types';

export const sanitizeEditOrder = (orderData: IConfigurableOrder) => {
  const { bestTimeToComeFrom, bestTimeToComeTo } = formatTime(orderData);

  const lineItems = orderData.lineItems?.map(lineItem => ({
    ...lineItem,
    customRatesGroupLineItemsId: lineItem.customRatesGroupLineItemsId,
    globalRatesLineItemsId:
      lineItem.globalRatesLineItem?.originalId ?? lineItem.globalRatesLineItemsId,
    materialId: lineItem.material?.originalId ?? lineItem.materialId ?? null,
    units: undefined,
  }));

  return {
    ...orderData,
    bestTimeToComeFrom,
    bestTimeToComeTo,
    lineItems,
    serviceDate: format(orderData.serviceDate, dateFormatsEnUS.ISO),
    payments: orderData.payments.map(payment => ({
      paymentId: payment.paymentId,
      paymentType: payment.paymentType,
      status: payment.status,
      deferredUntil: payment.deferredUntil
        ? format(payment.deferredUntil, dateFormatsEnUS.ISO)
        : undefined,
      checkNumber: payment.checkNumber ?? undefined,
      isAch: payment.paymentType === 'check' ? payment.isAch : undefined,
      creditCardId: payment.creditCardId ?? undefined,
      newCreditCard:
        payment.creditCardId === 0 && payment.newCreditCard
          ? sanitizeCreditCard(payment.newCreditCard)
          : undefined,
    })),
  };
};

interface IMapOrderRequestInput {
  ordersData: INewOrders;
  surcharges: ISurcharge[];
  region: Regions;
  commercialTaxesUsed: boolean;
}

export const mapNewOrderRequest = ({
  ordersData,
  surcharges,
  region,
  commercialTaxesUsed,
}: IMapOrderRequestInput) => {
  const [orderRequestMediaUrls, mediaFiles] = filterMediaFiles(ordersData.mediaUrls);

  return {
    mediaFiles,
    customerId: ordersData.customerId,
    businessUnitId: ordersData.businessUnitId,
    businessLineId: ordersData.businessLineId,
    commercialTaxesUsed,

    orders: ordersData.orders.map(order => {
      const { bestTimeToComeFrom, bestTimeToComeTo } = formatTime(order);

      return {
        ...order,
        ...pick(ordersData, [
          'jobSiteId',
          'projectId',
          'overrideCreditLimit',
          'serviceAreaId',
          'promoId',
          'grandTotal',
          'sendReceipt',
          'jobSiteContactId',
          'poRequired',
          'permitRequired',
          'signatureRequired',
          'cabOver',
          'alleyPlacement',
          'noBillableService',
          'orderRequestId',
        ]),
        globalRatesServicesId: order.customRatesGroupServicesId
          ? null
          : order.globalRatesServicesId,
        driverInstructions: order.driverInstructions ?? null,
        popupNote: ordersData.popupNote || null,
        orderRequestMediaUrls,
        bestTimeToComeFrom,
        bestTimeToComeTo,
        grandTotal: getOrderTotal({
          order,
          businessLineId: ordersData.businessLineId,
          region,
          taxDistricts: ordersData.taxDistricts,
          surcharges,
          commercialTaxesUsed,
        }),

        lineItems: order.lineItems.length
          ? order.lineItems.map(lineItem => ({
              ...lineItem,
              materialId: lineItem.materialId ?? null,
              units: undefined,
            }))
          : undefined,
      };
    }),
    payments: ordersData.payments,
  };
};

const mapLineItems = (lineItems: IProcessedOrderLineItem[]): IMapLineItems[] => {
  return lineItems.map(lineItem => {
    const sanitizedLineItem = {
      id: lineItem.id,
      billableLineItemId: lineItem.billableLineItem?.originalId ?? lineItem.billableLineItemId,
      price: lineItem.price,
      quantity: lineItem.quantity,
      customRatesGroupLineItemsId:
        lineItem.customRatesGroupLineItem?.originalId ?? lineItem.customRatesGroupLineItemsId,
      globalRatesLineItemsId:
        lineItem.globalRatesLineItem?.originalId ?? lineItem.globalRatesLineItemsId,
      materialId: lineItem.material?.originalId ?? lineItem.materialId ?? null,
      manifestNumber: lineItem?.manifestNumber,
      applySurcharges: lineItem.applySurcharges,
    };

    if (!lineItem.customRatesGroupLineItemsId) {
      delete sanitizedLineItem.customRatesGroupLineItemsId;
    }

    if (!sanitizedLineItem.id) {
      delete sanitizedLineItem.id;
    }

    return sanitizedLineItem;
  });
};

export const mapCompletedOrder = (order: IConfigurableOrder): IMapCompletedOrder => {
  const { workOrder } = order;

  const [mediaFiles, blobs] = filterMediaFiles(workOrder?.mediaFiles);

  return {
    noBillableService: !order.billableService || Boolean(order.thirdPartyHauler?.id),
    action: order.billableService?.action,
    disposalSiteId: order.disposalSiteId ?? null,
    driverInstructions: order.driverInstructions ?? null,
    invoiceNotes: order.invoiceNotes ?? null,
    materialId: order.materialId,
    equipmentItemId: order.equipmentItemId,
    projectId: order.projectId ?? null,
    promoId: order.promoId ?? null,
    billableServicePrice:
      order.billableServicePrice || order.billableServicePrice === 0
        ? +order.billableServicePrice
        : undefined,
    billableServiceId: order.billableService?.originalId ?? null,
    billableServiceApplySurcharges: !!order.billableService?.applySurcharges,
    thirdPartyHaulerId: order.thirdPartyHauler?.originalId ?? undefined,
    overrideCreditLimit: order.overrideCreditLimit,
    isRollOff: order.businessLine.type === BusinessLineType.rollOff,

    workOrder: workOrder?.woNumber
      ? ({
          id: workOrder?.id,
          woNumber: +workOrder?.woNumber,
          route: +workOrder?.route || null,
          truckId: workOrder?.truckId ?? null,
          driverId: workOrder?.driverId ?? null,
          droppedEquipmentItem: workOrder?.droppedEquipmentItem || null,
          pickedUpEquipmentItem: workOrder?.pickedUpEquipmentItem || null,
          weight: +workOrder?.weight || null,
          weightUnit: workOrder?.weightUnit || null,
          mediaFiles,
          completionDate: workOrder.completionDate ?? null,
          ...(order.businessLine.type === BusinessLineType.rollOff && {
            ticket: workOrder?.ticket ?? null,
            ticketUrl: workOrder?.ticketUrl ?? null,
            ticketAuthor: workOrder?.ticketAuthor || null,
            ticketFromCsr: workOrder?.ticketFromCsr || false,

            ticketDate: workOrder?.ticketDate,
            startWorkOrderDate: workOrder?.startWorkOrderDate,
            arriveOnSiteDate: workOrder?.arriveOnSiteDate,
            startServiceDate: workOrder?.startServiceDate,
            finishWorkOrderDate: workOrder?.finishServiceDate,
          }),
        } as IMapCompletedOrderWorkOrder)
      : undefined,
    lineItems: mapLineItems(order.lineItems ?? []),
    manifestItems: order.manifestItems ?? [],
    thresholds:
      order.thresholds?.map(threshold => ({
        id: threshold.id,
        thresholdId: threshold.thresholdId,
        threshold: threshold.threshold,
        price: threshold.price,
        quantity: threshold.quantity,
        applySurcharges: threshold.applySurcharges,
      })) ?? [],
    mediaFiles: blobs,
    ticketFile: order.ticketFile,
    paymentMethod: order.paymentMethod,
    grandTotal: order.grandTotal,
    customerId: order.customerId,
    updatedAt: order.updatedAt as Date,
    applySurcharges: order.applySurcharges,
    customRatesGroupId: order.customRatesGroupId ?? order.customRatesGroup?.originalId ?? undefined,
    newManifestItems: order.newManifestItems,
    manifestFiles: order.manifestFiles,
  };
};
