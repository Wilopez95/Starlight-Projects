export interface IHaulingServiceItemsParams {
  businessLineId?: number;
  routeId?: number;
  frequencyIds?: number[];
  serviceAreaIds?: number[];
  materialIds?: number[];
  equipmentIds?: number[];
  serviceDaysOfWeek?: number[];
  resetOffset?: boolean;
  cleanUp?: boolean;
}

export interface IHaulingServiceItemsQueryParams {
  businessLineId: number;
  frequencyIds: number[];
  serviceAreaIds?: number[];
  materialIds?: number[];
  equipmentIds?: number[];
  serviceDaysOfWeek?: number[];
}

export interface ICheckServiceItemsRouteStatus {
  available: number[];
  updating: number[];
  published: number[];
}
