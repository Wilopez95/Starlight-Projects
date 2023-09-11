export interface IServiceDays {
  value: number;
  label: string;
}

export interface IRouteServiceDays {
  id: number;
  serviceDaysList: IServiceDays[];
}

export interface IMasterRouteOption {
  value: number;
  label: string;
  serviceDaysList: number[];
}
