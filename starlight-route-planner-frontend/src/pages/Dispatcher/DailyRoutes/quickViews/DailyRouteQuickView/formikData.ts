import { IWorkOrderMapItem } from '@root/stores/workOrderMapItem/types';
import { IDailyRoute, IMapMergeData } from '@root/types';

export interface ICustomizedWorkOrder extends IWorkOrderMapItem, IMapMergeData {}

export const getInitialValues = (route: IDailyRoute | null, selectedServiceDate: Date) => {
  if (!route) {
    return {
      name: '',
      serviceDate: selectedServiceDate,
      color: '',
      workOrders: [] as ICustomizedWorkOrder[],
      truckId: undefined,
      driverId: undefined,
    };
  }

  return {
    id: route.id,
    name: route.name,
    serviceDate: new Date(route.serviceDate),
    truckId: route.truckId,
    driverId: route.driverId,
    color: route.color,
    workOrders: route.workOrders as unknown as ICustomizedWorkOrder[],
  };
};

export type FormDataType = ReturnType<typeof getInitialValues>;
