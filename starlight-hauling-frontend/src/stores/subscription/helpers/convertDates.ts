/* eslint-disable @typescript-eslint/no-use-before-define */

import { isNil } from 'lodash-es';

import { SubscriptionHistoryAttributeEnum } from '@root/consts';
import {
  convertDates,
  isAnnualEventReminderDescription,
  isDateSubscriptionHistoryAttribute,
  isPartialTaxDistrict,
  parseDate,
  substituteLocalTimeZoneInsteadUTC,
} from '@root/helpers';
import { ISubscriptionWorkOrderServiceItem } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  type IInvoicingSubscription,
  type IServiceItem,
  type ISubscription,
  type ISubscriptionHistoryRecord,
  type IWorkOrder,
  type ServiceFrequencyAggregated,
  type SubscriptionOrderServiceItem,
  ICustomerJobSitePair,
  IInvoicingSubscriptions,
  IPurchaseOrder,
  SubscriptionHistoryDescriptionValue,
} from '@root/types';
import { type JsonConversions } from '@root/types/helpers/JsonConversions';

const parseWorkOrderDate = (date: Date | null) =>
  date ? substituteLocalTimeZoneInsteadUTC(date) : null;

export const convertServiceItemDates = (
  serviceItem: JsonConversions<IServiceItem>,
): IServiceItem => ({
  ...convertDates(serviceItem),
  lineItems: serviceItem.lineItems.map(convertDates),
  billableService: convertDates(serviceItem.billableService),
  subscriptionOrders: serviceItem.subscriptionOrders?.map(subscriptionOrder => ({
    ...convertDates(subscriptionOrder),
    serviceDate: substituteLocalTimeZoneInsteadUTC(subscriptionOrder.serviceDate),
  })),
});

export const convertSubscriptionOrderServiceItemDates = (
  serviceItem: JsonConversions<SubscriptionOrderServiceItem>,
): SubscriptionOrderServiceItem => ({
  ...convertDates(serviceItem),
  billableService: convertDates(serviceItem.billableService),
});

export const convertWorkOrderServiceItemDates = (
  serviceItem: JsonConversions<ISubscriptionWorkOrderServiceItem>,
): ISubscriptionWorkOrderServiceItem => ({
  ...convertDates(serviceItem),
});

export const convertWorkOrderDates = (
  workOrder: JsonConversions<IWorkOrder> | undefined,
): IWorkOrder | undefined => {
  const newWorkOrder = convertDates(workOrder);

  if (newWorkOrder) {
    newWorkOrder.syncDate = parseWorkOrderDate(newWorkOrder.syncDate);
    newWorkOrder.arriveOnSiteDate = parseWorkOrderDate(newWorkOrder.arriveOnSiteDate);
    newWorkOrder.completionDate = parseWorkOrderDate(newWorkOrder.completionDate);
    newWorkOrder.startServiceDate = parseWorkOrderDate(newWorkOrder.startServiceDate);
    newWorkOrder.startWorkOrderDate = parseWorkOrderDate(newWorkOrder.startWorkOrderDate);
    newWorkOrder.ticketDate = parseWorkOrderDate(newWorkOrder.ticketDate);
    newWorkOrder.mediaFiles = newWorkOrder.mediaFiles.map(mediaFile => ({
      ...mediaFile,
      timestamp: parseWorkOrderDate(mediaFile.timestamp),
    }));
  }

  return newWorkOrder;
};

export const convertPurchaseOrderDates = (
  entity: JsonConversions<IPurchaseOrder>,
): IPurchaseOrder => ({
  ...convertDates(entity),
  effectiveDate: entity.effectiveDate
    ? substituteLocalTimeZoneInsteadUTC(entity.effectiveDate)
    : null,
  expirationDate: entity.expirationDate
    ? substituteLocalTimeZoneInsteadUTC(entity.expirationDate)
    : null,
});

export const convertFullSubscriptionDates = (
  entity: JsonConversions<IInvoicingSubscription>,
): IInvoicingSubscription => ({
  id: entity.id,
  createdAt: parseDate(entity.createdAt),
  updatedAt: parseDate(entity.updatedAt),
  jobSiteContactTextOnly: entity.jobSiteContactTextOnly,
  serviceName: entity.serviceName,
  serviceItems: entity.serviceItems?.map(convertServiceItemDates) || [],
  csrComment: entity.csrComment,
  minBillingPeriods: entity.minBillingPeriods,
  invoiceNotes: entity.invoiceNotes,
  callOnWayPhoneNumber: entity.callOnWayPhoneNumber,
  textOnWayPhoneNumber: entity.textOnWayPhoneNumber,
  beforeTaxesTotal: entity.beforeTaxesTotal,
  grandTotal: entity.grandTotal,
  billingType: entity.billingType,
  billingCycle: entity.billingCycle,
  anniversaryBilling: entity.anniversaryBilling,
  nextBillingPeriodTo: entity.nextBillingPeriodTo
    ? substituteLocalTimeZoneInsteadUTC(entity.nextBillingPeriodTo)
    : null,
  nextBillingPeriodFrom: entity.nextBillingPeriodFrom
    ? substituteLocalTimeZoneInsteadUTC(entity.nextBillingPeriodFrom)
    : null,
  nextServiceDate: substituteLocalTimeZoneInsteadUTC(entity.nextServiceDate),
  driverInstructions: entity.driverInstructions,
  highPriority: entity.highPriority,
  cancellationReasonType: entity.cancellationReasonType,
  cancellationComment: entity.cancellationComment,
  unapprovedComment: entity.unapprovedComment,
  unfinalizedComment: entity.unfinalizedComment,
  rescheduleComment: entity.rescheduleComment,
  jobSiteNote: entity.jobSiteNote,
  billableServiceTotal: entity.billableServiceTotal,
  billableLineItemsTotal: entity.billableLineItemsTotal,
  billableServicePrice: entity.billableServicePrice,
  thresholdsTotal: entity.thresholdsTotal,
  initialGrandTotal: entity.initialGrandTotal,
  purchaseOrder: entity.purchaseOrder ? convertPurchaseOrderDates(entity.purchaseOrder) : null,
  bestTimeToComeFrom: entity.bestTimeToComeFrom,
  bestTimeToComeTo: entity.bestTimeToComeTo,
  sendReceipt: entity.sendReceipt,
  unlockOverrides: entity.unlockOverrides,
  deferred: entity.deferred,
  businessUnit: convertDates(entity.businessUnit),
  businessLine: convertDates(entity.businessLine),
  status: entity.status,
  subscriptionContact: convertDates(entity.subscriptionContact),
  someoneOnSite: entity.someoneOnSite,

  jobSite: convertDates(entity.jobSite),
  jobSiteContact: convertDates(entity.jobSiteContact),
  billableService: convertDates(entity.billableService),
  customRatesGroup: convertDates(entity.customRatesGroup),
  csr: convertDates(entity.csr),
  csrEmail: entity.csrEmail,
  material: convertDates(entity.material),
  globalRatesServices: convertDates(entity.globalRatesServices),
  customRatesGroupServices: convertDates(entity.customRatesGroupServices),
  lineItems: entity.lineItems?.map(convertDates),
  thresholds: entity.thresholds?.map(convertDates),
  customerJobSite: convertDates(entity.customerJobSite),
  thirdPartyHauler: convertDates(entity.thirdPartyHauler),
  permit: convertDates(entity.permit),
  promo: convertDates(entity.promo),
  taxDistricts: entity.taxDistricts?.map(district =>
    isPartialTaxDistrict(district) ? district : convertDates(district),
  ),
  workOrder: convertWorkOrderDates(entity.workOrder),
  serviceArea: convertDates(entity.serviceArea),
  startDate: substituteLocalTimeZoneInsteadUTC(entity.startDate),
  endDate: entity.endDate ? substituteLocalTimeZoneInsteadUTC(entity.endDate) : null,
  oneTimeOrdersSequenceIds: entity.oneTimeOrdersSequenceIds,
  reason: entity.reason,
  reasonDescription: entity.reasonDescription,
  holdSubscriptionUntil: entity.holdSubscriptionUntil
    ? substituteLocalTimeZoneInsteadUTC(entity.holdSubscriptionUntil)
    : null,
  equipmentItem: convertDates(entity.equipmentItem),
  currentSubscriptionPrice: entity.currentSubscriptionPrice,
  invoicedDate: entity.invoicedDate ? substituteLocalTimeZoneInsteadUTC(entity.invoicedDate) : null,
});

export const convertSubscriptionDates = (
  entity: JsonConversions<ISubscription>,
): ISubscription => ({
  ...convertFullSubscriptionDates(entity),
  customer: convertDates(entity.customer),
  jobSite: convertDates(entity.jobSite),
});

export const convertInvoicingSubscriptionDates = (
  entity: JsonConversions<IInvoicingSubscriptions>,
): IInvoicingSubscriptions => ({
  id: entity.id,
  anniversaryBilling: entity.anniversaryBilling,
  billingCycle: entity.billingCycle,
  billingType: entity.billingType,
  businessLineId: entity.businessLineId,
  businessUnitId: entity.businessUnitId,
  endDate: entity.endDate ? substituteLocalTimeZoneInsteadUTC(entity.endDate) : null,
  nextBillingPeriodFrom: entity.nextBillingPeriodFrom
    ? substituteLocalTimeZoneInsteadUTC(entity.nextBillingPeriodFrom)
    : 0,
  nextBillingPeriodTo: entity.nextBillingPeriodTo
    ? substituteLocalTimeZoneInsteadUTC(entity.nextBillingPeriodTo)
    : 0,
  startDate: entity.startDate ? substituteLocalTimeZoneInsteadUTC(entity.startDate) : null,
  summaryPerServiceItem: entity.summaryPerServiceItem,
  serviceItems: entity.serviceItems,
  totalPriceForSubscription: entity.totalPriceForSubscription,
  jobSiteAddress: entity.jobSiteAddress,
  status: entity.status,
});

export const convertServiceFrequency = (
  entity: JsonConversions<ServiceFrequencyAggregated>,
): ServiceFrequencyAggregated => {
  if (entity === 'multiple' || !entity) {
    return entity;
  }

  const parsedEntity = {
    ...entity,
    effectiveDate: substituteLocalTimeZoneInsteadUTC(entity.effectiveDate),
    createdAt: parseDate(entity.createdAt),
    updatedAt: parseDate(entity.updatedAt),
  };

  return parsedEntity;
};

export const convertJobSiteCustomerPairDates = (
  entity?: JsonConversions<ICustomerJobSitePair>,
): ICustomerJobSitePair | undefined => {
  if (!entity) {
    return entity;
  }

  return {
    ...entity,
    createdAt: parseDate(entity.createdAt),
    updatedAt: parseDate(entity.updatedAt),
    taxDistricts: entity.taxDistricts?.map(convertDates),
    purchaseOrders: entity.purchaseOrders?.map(convertPurchaseOrderDates),
  };
};

const convertDescriptionValueDates = (
  value: JsonConversions<Exclude<SubscriptionHistoryDescriptionValue, Date>>,
  attribute: SubscriptionHistoryAttributeEnum | null,
): SubscriptionHistoryDescriptionValue => {
  if (isDateSubscriptionHistoryAttribute(attribute)) {
    return parseDate(value);
  }

  if (isAnnualEventReminderDescription(value, attribute)) {
    return {
      ...value,
      date: parseDate(value.date),
    };
  }

  return value;
};

export const convertSubscriptionHistoryRecordDates = (
  subscriptionHistoryRecord: JsonConversions<ISubscriptionHistoryRecord>,
): ISubscriptionHistoryRecord => {
  return {
    ...subscriptionHistoryRecord,
    createdAt: parseDate(subscriptionHistoryRecord.createdAt),
    updatedAt: parseDate(subscriptionHistoryRecord.updatedAt),
    effectiveDate: subscriptionHistoryRecord.effectiveDate
      ? parseDate(subscriptionHistoryRecord.effectiveDate)
      : null,
    description: {
      ...subscriptionHistoryRecord.description,
      closeDate: subscriptionHistoryRecord.description.closeDate
        ? parseDate(subscriptionHistoryRecord.description.closeDate)
        : undefined,
      newValue: isNil(subscriptionHistoryRecord.description.newValue)
        ? undefined
        : convertDescriptionValueDates(
            subscriptionHistoryRecord.description.newValue,
            subscriptionHistoryRecord.attribute,
          ),
      previousValue: isNil(subscriptionHistoryRecord.description.previousValue)
        ? undefined
        : convertDescriptionValueDates(
            subscriptionHistoryRecord.description.previousValue,
            subscriptionHistoryRecord.attribute,
          ),
    },
  };
};
