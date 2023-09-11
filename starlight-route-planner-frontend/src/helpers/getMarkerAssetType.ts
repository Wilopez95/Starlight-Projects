import { MarkerAssetType, ServiceDaysOfWeek, ServiceDaysOfWeekValue } from '@root/common';

export const getMarkerAssetType = (serviceDaysOfWeek: ServiceDaysOfWeek) => {
  let type: MarkerAssetType = MarkerAssetType.unassigned;
  const serviceDaysOfWeekValues = Object.values(serviceDaysOfWeek);
  const routes = serviceDaysOfWeekValues
    .map(({ route }: ServiceDaysOfWeekValue) => route)
    .filter(Boolean);

  if (routes.length > 0) {
    type =
      routes.length === serviceDaysOfWeekValues.length
        ? MarkerAssetType.assigned
        : MarkerAssetType.partialAssigned;
  }

  return type;
};
