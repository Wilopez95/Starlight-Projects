export interface IServiceDaysAndTime {
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  active: boolean;
  businessUnitId?: number;
  id?: number;
}
