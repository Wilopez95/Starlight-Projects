import intersection from 'lodash/intersection.js';
import groupBy from 'lodash/groupBy.js';
import { BUSINESS_LINE_ROUTE_TYPE, BUSINESS_LINE_TYPE } from '../consts/businessLineTypes.js';
import { SUBSCRIPTION_WO_STATUS } from '../consts/workOrder.js';

export const checkAttachPossibilityBasedOnLOB = (items, businessLines) => {
  if (!businessLines?.length) {
    return false;
  }

  const PTBusinessLineIds = businessLines
    .filter(({ type }) => type === BUSINESS_LINE_TYPE.portableToilets)
    .map(({ id }) => id);

  const PTItems = items.filter(({ businessLineId }) => PTBusinessLineIds.includes(businessLineId));

  if (!PTItems.length || PTItems.length === items.length) {
    return true;
  }

  return false;
};

/**
 * It takes an array of lob ids and a map of lob groups, and returns a function that takes a lob type
 * and returns the intersection of the lob ids and the lob ids in the group of the given type
 * @param lobIds - an array of line of business ids
 * @param lobGroupedByType - an object that contains the LOBs grouped by type.
 * @returns An array of lobIds that are in the intersection of the lobIds and the lobGroupIds.
 * @example lobGroupedByType = {
 *   rollOff: [{ id: 1, type: 'rollOff' }],
 *   commercialWaste: [{ id: 2, type: 'commercialWaste' }],
 *   residentialWaste: [{ id: 3, type: 'residentialWaste'}],
 *   portableToilets: [{ id: 4, type: 'portableToilets'}],
 * }
 */
const getLobIntersectionFn = (lobIds, lobGroupedByType) => lobType => {
  const lobGroup = lobGroupedByType[lobType];
  if (Array.isArray(lobGroup)) {
    const lobGroupIds = lobGroup.map(({ id }) => id);

    return intersection(lobIds, lobGroupIds);
  }
  return [];
};

/**
 * "Given a list of items (service or workOrder) and a list of business lines, return the route type."
 *  - groups by line of business and checks if there is an intersection between the items and the business lines
 * @param items - an array of objects representing a work order or service that have a businessLineId property
 * @param businessLines - an array of business line objects that have an id and type property
 */
export const getRouteLOBTypeFromItems = (items, businessLines) => {
  if (!items?.length || !businessLines?.length) {
    return null;
  }
  const businessLinesGroupedByType = groupBy(businessLines, 'type');
  const presentLobIds = [...new Set(items.map(({ businessLineId }) => businessLineId))];

  const getLobIntersection = getLobIntersectionFn(presentLobIds, businessLinesGroupedByType);

  const hasPT = getLobIntersection(BUSINESS_LINE_TYPE.portableToilets).length;

  const hasCommercial = getLobIntersection(BUSINESS_LINE_TYPE.commercialWaste).length;
  const hasResidential = getLobIntersection(BUSINESS_LINE_TYPE.residentialWaste).length;

  if (hasPT) {
    return BUSINESS_LINE_ROUTE_TYPE.portableToilets;
  }

  if (hasCommercial && hasResidential) {
    return BUSINESS_LINE_ROUTE_TYPE.commercialResidential;
  }

  if (hasCommercial) {
    return BUSINESS_LINE_ROUTE_TYPE.commercial;
  }

  return BUSINESS_LINE_ROUTE_TYPE.residential;
};

export const getBusinessLineTypesByRouteTypes = routeTypes => {
  const result = new Set();

  if (
    routeTypes.includes(BUSINESS_LINE_ROUTE_TYPE.commercial) ||
    routeTypes.includes(BUSINESS_LINE_ROUTE_TYPE.commercialResidential)
  ) {
    result.add(BUSINESS_LINE_TYPE.commercialWaste);
  }

  if (
    routeTypes.includes(BUSINESS_LINE_ROUTE_TYPE.residential) ||
    routeTypes.includes(BUSINESS_LINE_ROUTE_TYPE.commercialResidential)
  ) {
    result.add(BUSINESS_LINE_TYPE.residentialWaste);
  }

  if (routeTypes.includes(BUSINESS_LINE_ROUTE_TYPE.portableToilets)) {
    result.add(BUSINESS_LINE_TYPE.portableToilets);
  }

  if (!result.size) return null;

  return Array.from(result);
};

export const countCompletionRate = (route = {}) => {
  const { workOrders } = route;

  if (workOrders?.length === 0) {
    return 0;
  }

  const nonScheduledWOs = workOrders.filter(wo => wo.status !== SUBSCRIPTION_WO_STATUS.scheduled);

  const ratio = nonScheduledWOs.length / workOrders.length;

  return ratio > 0 ? Math.floor(ratio * 100) : 0;
};
