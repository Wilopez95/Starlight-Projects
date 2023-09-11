// @ts-check

export default class ServiceItemMapper {
  static mapCreateMasterRouteInputServiceItemsToServiceItems(inputServiceItems) {
    const serviceItems = inputServiceItems.map(serviceItem => ({
      haulingId: serviceItem.id,
      ...serviceItem,
    }));

    return serviceItems;
  }

  static mapServiceItemsFromHauling(serviceItems) {
    return serviceItems.map(serviceItem => ({
      id: serviceItem.id,
      haulingId: serviceItem.id,
      serviceFrequencyId: serviceItem.serviceFrequencyId,
      jobSiteId: serviceItem.jobSite.id,
      businessLineId: serviceItem.subscription.businessLineId,
      businessUnitId: serviceItem.subscription.businessUnitId,
      materialId: serviceItem.materialOriginalId,
      subscriptionId: serviceItem.subscription.id,
      billableServiceId: serviceItem.billableService.id,
      billableServiceDescription: serviceItem.billableService.description,
      startDate: serviceItem.subscription.startDate,
      endDate: serviceItem.subscription.endDate,
      equipmentItemId: serviceItem.billableService.equipmentItemId,
      serviceDaysOfWeek: serviceItem.serviceDaysOfWeek,
      serviceAreaId: serviceItem.serviceAreaOriginalId,
      bestTimeToComeFrom: serviceItem.subscription.bestTimeToComeFrom,
      bestTimeToComeTo: serviceItem.subscription.bestTimeToComeTo,
    }));
  }
}
