import { IWorkOrdersDailyRouteParams } from '@root/api/workOrdersDailyRoute';

export const defaultValues = (lobId: number): Omit<IWorkOrdersDailyRouteParams, 'serviceDate'> => ({
  businessLineId: lobId,
  serviceAreaIds: undefined,
  materialIds: undefined,
  equipmentItemIds: undefined,
});
