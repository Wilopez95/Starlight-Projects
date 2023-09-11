export interface IWorkOrdersDailyRouteParams {
  businessLineId: number;
  serviceDate: string;
  serviceAreaIds?: number[];
  materialIds?: number[];
  equipmentItemIds?: number[];
}

export interface ICheckWorkOrdersRouteStatus {
  available: number[];
  updating: number[];
}
