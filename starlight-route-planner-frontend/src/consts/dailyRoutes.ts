export enum DailyRouteStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SCHEDULED = 'SCHEDULED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
  // only on UI based on editingBy prop
  UPDATING = 'UPDATING',
}
