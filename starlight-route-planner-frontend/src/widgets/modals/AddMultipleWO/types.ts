export interface IWorkOrdersDataTable {
  id: number;
  time: string;
  displayId: number | string;
  dailyRouteId?: number;
  serviceType?: string;
  materialType?: string;
  equipmentSize?: string;
}

export interface IAddMultipleWO {
  multipleItems: number[];
  onClose: () => void;
  onSubmit: (ids: number[]) => void;
}
