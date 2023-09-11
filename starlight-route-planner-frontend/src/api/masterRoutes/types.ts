import { BusinessLineTypeSymbol } from '@root/consts';
import { IHaulingServiceItem } from '@root/types';

interface IMasterRoutesListFilters {
  businessLineTypes?: BusinessLineTypeSymbol[];
  published?: boolean;
  serviceAreaIds?: number[];
  serviceDay?: number[];
  serviceDaysOfWeek?: number[];
  materialIds?: number[];
  equipmentIds?: number[];
  frequencyIds?: number[];
  businessLineId?: number;
}

export interface IMasterRoutesListParams {
  businessUnitId: number;
  input: IMasterRoutesListFilters;
}

export interface ICreateMasterRouteParams {
  name: string;
  truckId?: string;
  driverId?: number;
  businessUnitId: number;
  color: string;
  serviceDaysList: number[];
  serviceItems: Omit<IHaulingServiceItem, 'jobSite' | 'subscription'>[];
}

export interface IUpdateMasterRouteParams {
  id: number;
  name?: string;
  truckId?: string;
  driverId?: number;
  serviceDaysList: number[];
  serviceItems: Omit<IHaulingServiceItem, 'jobSite' | 'subscription'>[];
}

export interface IMasterRoutesGridFilters {
  businessLineTypes?: string[];
  published?: boolean;
  serviceAreaIds?: number[];
  materialIds?: number[];
  equipmentIds?: number[];
  frequencyIds?: number[];
  businessLineId?: number | null;
  serviceDay?: string[] | number[];
  skip: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}
