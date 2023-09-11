import validate from '../../../utils/validate.js';
import { HaulingService } from '../../../services/hauling.js';
// import { PricingService } from '../../../services/pricing.js';
import { getBusinessLineTypesByRouteTypes } from '../../../utils/routeHelpers.js';
import { WAYPOINT_TYPE } from '../../../consts/waypointTypes.js';
import { getHaulingServiceItemsSchema } from './schema.js';

export const haulingServiceItems = async (_, payload, { dataSources }) => {
  const { businessUnitId, filters } = validate({
    schema: getHaulingServiceItemsSchema,
    params: payload,
  });

  const result = await dataSources.haulingAPI.getServiceItems(businessUnitId, filters);

  return result;
};

export const haulingBusinessLines = async (_, __, { dataSources }) =>
  dataSources.haulingAPI.getBusinessLines();

export const haulingDisposalSites = async (_, { onlyLandfills }, { dataSources }) => {
  let disposals = await dataSources.haulingAPI.getDisposalSites();

  if (onlyLandfills) {
    disposals = disposals.filter(disposal => disposal.waypointType === WAYPOINT_TYPE.landfill);
  }

  return disposals;
};

export const haulingEquipmentItems = async (_, { businessLineId }, { dataSources }) =>
  dataSources.haulingAPI.getEquipmentItems(businessLineId);

export const haulingMaterials = async (_, { input }, { dataSources }) =>
  dataSources.haulingAPI.getMaterials(input);

export const haulingServiceAreas = async (
  _,
  { businessUnitId, businessLineIds },
  { dataSources },
) => dataSources.haulingAPI.getServiceAreas(businessUnitId, businessLineIds);

export const haulingServiceAreasByIds = async (_, { ids }, { dataSources }) =>
  dataSources.haulingAPI.getServiceAreasByIds(ids);

export const haulingSubscriptionOrder = async (_, { id }, { user }) =>
  HaulingService.getSubscriptionOrder({ schemaName: user.schemaName, id });

export const haulingIndependentOrder = async (_, { id }, { user }) =>
  HaulingService.getIndependentOrder({ schemaName: user.schemaName, id });
// return PricingService.getIndependentOrder({ schemaName: user.schemaName, id });

export const hauling3rdPartyHaulers = async (_, __, { dataSources }) =>
  dataSources.haulingAPI.get3rdPartyHaulers();

export const haulingTrucks = async (_, { businessUnitId, businessLineTypes }, { dataSources }) => {
  let businessLineIds;

  if (businessLineTypes?.length) {
    const allBusinessLines = await dataSources.haulingAPI.getBusinessLines();

    const allowedBusinessLineTypes = getBusinessLineTypesByRouteTypes(businessLineTypes);

    businessLineIds = allBusinessLines
      .filter(({ type }) => allowedBusinessLineTypes?.includes(type))
      .map(({ id }) => id);
  }

  return dataSources.haulingAPI.getTrucks(businessUnitId, businessLineIds);
};

export const haulingTruck = async (_, { id }, { dataSources }) =>
  dataSources.haulingAPI.getTruck(id);

export const haulingDrivers = async (_, { businessUnitId, truckId }, { dataSources }) =>
  dataSources.haulingAPI.getDrivers(businessUnitId, truckId);

export const haulingDriver = async (_, { id }, { dataSources }) =>
  dataSources.haulingAPI.getDriver(id);

export const haulingTruckTypes = async (_, __, { dataSources }) =>
  dataSources.haulingAPI.getTruckTypes();
