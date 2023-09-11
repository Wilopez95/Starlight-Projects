import { ICustomizedServiceItem } from '@root/providers/MasterRoutesMapProvider';
import { IMasterRoute } from '@root/types';

import { IMasterRouteCustomizedFormValues } from './types';

export const getInitialValues = (route: IMasterRoute | null): IMasterRouteCustomizedFormValues => {
  if (!route) {
    return {
      serviceDaysList: [] as number[],
      name: '',
      truckId: undefined,
      driverId: undefined,
      serviceItems: [],
      color: undefined,
    };
  }

  return {
    name: route.name,
    truckId: route.truckId,
    driverId: route.driverId,
    color: route.color,
    serviceItems: route.serviceItems as ICustomizedServiceItem[],
    serviceDaysList: route.serviceDaysList,
  };
};
