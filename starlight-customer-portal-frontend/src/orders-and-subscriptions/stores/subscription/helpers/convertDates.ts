import { convertDates, isPartialTaxDistrict, parseDate } from '@root/core/helpers';
import type {
  IInvoicingSubscription,
  IServiceItem,
  ISubscription,
  IWorkOrder,
} from '@root/core/types';
import type { JsonConversions } from '@root/core/types/helpers/JsonConversions';

const parseWorkOrderDate = (date: Date | null) => (date ? parseDate(date) : null);

export const convertServiceItemDates = (
  serviceItem: JsonConversions<IServiceItem>,
): IServiceItem => ({
  ...convertDates(serviceItem),
  billableService: convertDates(serviceItem.billableService),
});

export const convertSubscriptionDates = (
  entity: JsonConversions<ISubscription>,
): ISubscription => ({
  ...convertInvoicingSubscriptionDates(entity),
  customer: convertDates(entity.customer),
  jobSite: convertDates(entity.jobSite),
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
    newWorkOrder.mediaFiles = newWorkOrder.mediaFiles.map((mediaFile) => ({
      ...mediaFile,
      timestamp: parseWorkOrderDate(mediaFile.timestamp),
    }));
  }

  return newWorkOrder;
};

export const convertInvoicingSubscriptionDates = (
  entity: JsonConversions<IInvoicingSubscription>,
): IInvoicingSubscription => ({
  id: entity.id,
  createdAt: parseDate(entity.createdAt),
  updatedAt: parseDate(entity.updatedAt),
  route: entity.route,
  jobSiteContactTextOnly: entity.jobSiteContactTextOnly,
  serviceName: entity.serviceName,
  serviceItems: entity.serviceItems?.map(convertServiceItemDates) || [],
  csrNotes: entity.csrNotes,
  invoiceNotes: entity.invoiceNotes,
  callOnWayPhoneNumber: entity.callOnWayPhoneNumber,
  textOnWayPhoneNumber: entity.textOnWayPhoneNumber,
  beforeTaxesTotal: entity.beforeTaxesTotal,
  grandTotal: entity.grandTotal,
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
  purchaseOrder: entity.purchaseOrder,
  bestTimeToComeFrom: entity.bestTimeToComeFrom,
  bestTimeToComeTo: entity.bestTimeToComeTo,
  sendReceipt: entity.sendReceipt,
  paymentMethod: entity.paymentMethod,
  deferred: entity.deferred,
  payments: entity.payments?.map(convertDates) ?? [],
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
  material: convertDates(entity.material),
  globalRatesServices: convertDates(entity.globalRatesServices),
  customRatesGroupServices: convertDates(entity.customRatesGroupServices),
  lineItems: entity.lineItems?.map(convertDates),
  thresholds: entity.thresholds?.map(convertDates),
  customerJobSite: convertDates(entity.customerJobSite),
  thirdPartyHauler: convertDates(entity.thirdPartyHauler),
  permit: convertDates(entity.permit),
  promo: convertDates(entity.promo),
  taxDistricts: entity.taxDistricts?.map((district) =>
    isPartialTaxDistrict(district) ? district : convertDates(district),
  ),
  workOrder: convertWorkOrderDates(entity.workOrder),
  serviceArea: convertDates(entity.serviceArea),
  startDate: parseDate(entity.startDate),
  endDate: entity.endDate ? parseDate(entity.endDate) : null,
  oneTimeOrdersIds: entity.oneTimeOrdersIds,
  nextBillingPeriodTo: parseDate(entity.nextBillingPeriodTo),
  nextBillingPeriodFrom: parseDate(entity.nextBillingPeriodFrom),
  billingType: entity.billingType,
  billingCycle: entity.billingCycle,
});
