import {
  convertDates,
  isPartialTaxDistrict,
  parseDate,
  substituteLocalTimeZoneInsteadUTC,
} from '@root/helpers';
import { convertPurchaseOrderDates } from '@root/stores/subscription/helpers';
import {
  type IInvoicingOrder,
  type IOrder,
  type IWorkOrder,
  type JsonConversions,
} from '@root/types';

const parseWorkOrderDate = (date: Date | null) =>
  date ? substituteLocalTimeZoneInsteadUTC(date) : new Date();

export const convertOrderDates = (entity: JsonConversions<IOrder>): IOrder => ({
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  ...convertInvoicingOrderDates(entity),
  customer: convertDates(entity.customer),
  jobSite: convertDates(entity.jobSite),
});

export const convertWorkOrderDates = (
  workOrder: JsonConversions<IWorkOrder> | undefined,
): IWorkOrder | undefined => {
  const newWorkOrder = convertDates(workOrder);

  if (newWorkOrder) {
    newWorkOrder.syncDate = parseDate(newWorkOrder.syncDate);
    newWorkOrder.arriveOnSiteDate = parseWorkOrderDate(newWorkOrder.arriveOnSiteDate);
    newWorkOrder.completionDate = parseWorkOrderDate(newWorkOrder.completionDate);
    newWorkOrder.startServiceDate = parseWorkOrderDate(newWorkOrder.startServiceDate);
    newWorkOrder.startWorkOrderDate = parseWorkOrderDate(newWorkOrder.startWorkOrderDate);
    newWorkOrder.ticketDate = parseWorkOrderDate(newWorkOrder.ticketDate);
    newWorkOrder.finishWorkOrderDate = parseWorkOrderDate(newWorkOrder.finishWorkOrderDate);
    newWorkOrder.mediaFiles = newWorkOrder.mediaFiles.map(mediaFile => ({
      ...mediaFile,
      timestamp: parseDate(mediaFile.timestamp),
    }));
  }

  return newWorkOrder;
};

export const convertInvoicingOrderDates = (
  entity: JsonConversions<IInvoicingOrder>,
): IInvoicingOrder => ({
  id: entity.id,
  createdAt: parseDate(entity.createdAt),
  updatedAt: parseDate(entity.updatedAt),
  invoiceNotes: entity.invoiceNotes,
  callOnWayPhoneNumber: entity.callOnWayPhoneNumber,
  callOnWayPhoneNumberId: entity.callOnWayPhoneNumberId,
  textOnWayPhoneNumber: entity.textOnWayPhoneNumber,
  textOnWayPhoneNumberId: entity.textOnWayPhoneNumberId,
  beforeTaxesTotal: entity.beforeTaxesTotal,
  droppedEquipmentItem: entity.droppedEquipmentItem,
  grandTotal: entity.grandTotal,
  driverInstructions: entity.driverInstructions,
  someoneOnSite: entity.someoneOnSite,
  toRoll: entity.toRoll,
  highPriority: entity.highPriority,
  earlyPick: entity.earlyPick,
  cancellationReasonType: entity.cancellationReasonType,
  cancellationComment: entity.cancellationComment,
  unapprovedComment: entity.unapprovedComment,
  unfinalizedComment: entity.unfinalizedComment,
  rescheduleComment: entity.rescheduleComment,
  jobSiteNote: entity.jobSiteNote,
  billableServiceTotal: entity.billableServiceTotal,
  billableServiceApplySurcharges: entity.billableServiceApplySurcharges,
  billableLineItemsTotal: entity.billableLineItemsTotal,
  billableServicePrice: entity.billableServicePrice,
  thresholdsTotal: entity.thresholdsTotal,
  initialGrandTotal: entity.initialGrandTotal,
  purchaseOrder: entity.purchaseOrder ? convertPurchaseOrderDates(entity.purchaseOrder) : null,
  bestTimeToComeFrom: entity.bestTimeToComeFrom,
  bestTimeToComeTo: entity.bestTimeToComeTo,
  sendReceipt: entity.sendReceipt,
  notifyDayBefore: entity.notifyDayBefore,
  alleyPlacement: entity.alleyPlacement,
  cabOver: entity.cabOver,
  paymentMethod: entity.paymentMethod,
  deferred: entity.deferred,
  applySurcharges: entity.applySurcharges,
  landfillOperationId: entity.landfillOperationId,
  surchargesTotal: entity.surchargesTotal,
  payments: entity.payments?.map(convertDates) ?? [],
  businessUnit: convertDates(entity.businessUnit),
  businessLine: convertDates(entity.businessLine),
  status: entity.status,
  orderContact: convertDates(entity.orderContact),
  orderContactId: entity.orderContactId,

  jobSite: convertDates(entity.jobSite),
  jobSite2: convertDates(entity.jobSite2),
  materialProfile: convertDates(entity.materialProfile),
  jobSiteContact: convertDates(entity.jobSiteContact),
  jobSiteContactId: entity.jobSiteContactId,
  disposalSite: convertDates(entity.disposalSite),
  billableService: convertDates(entity.billableService),
  customRatesGroup: convertDates(entity.customRatesGroup),
  csr: convertDates(entity.csr),
  material: convertDates(entity.material),
  globalRatesServices: convertDates(entity.globalRatesServices),
  globalRatesServicesId: entity.globalRatesServicesId,
  customRatesGroupServices: convertDates(entity.customRatesGroupServices),
  project: convertDates(entity.project),
  lineItems: entity.lineItems?.map(convertDates),
  thresholds: entity.thresholds?.map(convertDates),
  customerJobSite: convertDates(entity.customerJobSite),
  thirdPartyHauler: convertDates(entity.thirdPartyHauler),
  permit: convertDates(entity.permit),
  promo: convertDates(entity.promo),
  taxDistricts: entity.taxDistricts?.map(district =>
    isPartialTaxDistrict(district) ? district : convertDates(district),
  ),
  surcharges: entity.surcharges?.map(surcharge => convertDates(surcharge)),
  workOrder: convertWorkOrderDates(entity.workOrder),
  serviceDate: substituteLocalTimeZoneInsteadUTC(entity.serviceDate),
  serviceArea: convertDates(entity.serviceArea),
  equipmentItem: convertDates(entity.equipmentItem),
  manifestItems: entity.manifestItems?.map(convertDates),
  netWeight: entity.netWeight,
  graded: entity.graded,
  hasWeightTicket: entity.hasWeightTicket,
  commercialTaxesUsed: entity.commercialTaxesUsed,
  csrName: entity.csrName,
});
