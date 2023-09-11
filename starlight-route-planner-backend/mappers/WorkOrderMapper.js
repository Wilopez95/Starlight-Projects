// @ts-check
import { WO_STATUS, SUBSCRIPTION_WO_STATUS } from '../consts/workOrder.js';

/**
 *
 * @param {String} status
 * @returns {String}
 */
const mapHaulingIndependentStatus = status => {
  switch (status) {
    case 'inProgress':
      return WO_STATUS.inProgress;
    case 'completed':
      return WO_STATUS.completed;
    case 'approved':
      return WO_STATUS.approved;
    case 'finalized':
      return WO_STATUS.finalized;
    case 'canceled':
      return WO_STATUS.canceled;
    case 'invoiced':
      return WO_STATUS.invoiced;
    default:
      return WO_STATUS.scheduled;
  }
};

export default class WorkOrderMapper {
  static mapSubscriptionWorkOrdersFromHauling({
    subscriptionWorkOrderDetails: details,
    subscriptionWorkOrders: workOrders,
  }) {
    return workOrders.map(wo => ({
      preferredRoute: wo.preferredRoute,
      workOrderId: wo.id,
      orderId: wo.subscriptionOrderId,
      displayId: wo.sequenceId,
      orderDisplayId: wo.subscriptionOrderSequenceId,
      status: wo.status,
      signatureRequired: wo.signatureRequired,
      toRoll: wo.toRoll,
      alleyPlacement: wo.alleyPlacement,
      bestTimeToComeTo: wo.bestTimeToComeTo,
      bestTimeToComeFrom: wo.bestTimeToComeFrom,
      someoneOnSite: wo.someoneOnSite,
      highPriority: wo.highPriority,
      serviceDate: wo.serviceDate,
      instructionsForDriver: wo.instructionsForDriver,
      poRequired: wo.poRequired,
      permitRequired: wo.permitRequired,
      pickedUpEquipment: wo.pickedUpEquipmentItem,
      droppedEquipment: wo.droppedEquipmentItem,
      completedAt: wo.completedAt,

      jobSiteNote: details.jobSiteNote,
      businessLineId: details.businessLineId,
      businessUnitId: details.businessUnitId,
      serviceAreaId: details.serviceAreaId,
      customerId: details.customerId,
      phoneNumber: details.mainPhoneNumber,
      jobSiteId: details.jobSiteId,
      materialId: details.materialId,
      equipmentItemId: details.equipmentItemId,
      equipmentItemSize: details.equipmentItemSize,
      billableServiceId: details.billableServiceId,
      billableServiceDescription: details.billableServiceDescription,
      subscriptionId: details.subscriptionId,
      serviceItemId: details.serviceItemId,
      thirdPartyHaulerId: details.thirdPartyHaulerId,
      thirdPartyHaulerDescription: details.thirdPartyHaulerDescription,

      isIndependent: false,
    }));
  }

  static mapIndependentWorkOrdersFromHauling({
    independentWorkOrderDetails: details,
    independentWorkOrders: workOrders,
  }) {
    return workOrders.map(wo => ({
      preferredRoute: wo.preferredRoute,
      workOrderId: wo.independentWorkOrderId,
      orderId: wo.orderId,
      displayId: String(wo.woNumber),
      orderDisplayId: String(wo.orderId),
      status: mapHaulingIndependentStatus(wo.status),
      businessLineId: wo.businessLineId,
      businessUnitId: wo.businessUnitId,
      signatureRequired: wo.signatureRequired,
      toRoll: wo.toRoll,
      alleyPlacement: wo.alleyPlacement,
      bestTimeToComeTo: wo.bestTimeToComeTo,
      bestTimeToComeFrom: wo.bestTimeToComeFrom,
      someoneOnSite: wo.someoneOnSite,
      highPriority: wo.highPriority,
      serviceDate: wo.serviceDate, // format this
      pickedUpEquipment: wo.pickedUpEquipmentItem,
      droppedEquipment: wo.droppedEquipmentItem,
      completedAt: wo.completionDate,

      serviceAreaId: details.serviceAreaId,
      customerId: details.customerId,
      phoneNumber: details.mainPhoneNumber,
      jobSiteId: details.jobSiteId,
      materialId: details.materialId,
      equipmentItemId: details.equipmentItemId,
      equipmentItemSize: details.equipmentItemSize,
      billableServiceId: details.billableServiceId,
      billableServiceDescription: details.billableServiceDescription,
      poRequired: details.poRequired,
      permitRequired: details.permitRequired,
      instructionsForDriver: details.instructionsForDriver,
      jobSiteNote: details.jobSiteNote,
      thirdPartyHaulerId: details.thirdPartyHaulerId,
      thirdPartyHaulerDescription: details.thirdPartyHaulerDescription,

      isIndependent: true,
    }));
  }

  static mapToBulkStatusChange({ workOrders, status, cancellationReason, cancellationComment }) {
    return workOrders.map(({ id, completedAt }) => ({
      id,
      status,
      cancellationReason,
      cancellationComment,
      ...(status === SUBSCRIPTION_WO_STATUS.completed
        ? {
            completedAt: completedAt || new Date().toUTCString(),
          }
        : { completedAt: null }),
    }));
  }

  static mapWorkOrdersToSoftDelete(options) {
    const { ids, isIndependent } = options;

    const mappedData = ids.map(id => ({
      workOrderId: id,
      isIndependent,
      status: WO_STATUS.deleted,
      deletedAt: new Date(),
      dailyRouteId: null,
      assignedRoute: null,
      preferredRoute: null,
    }));

    return mappedData;
  }
}
