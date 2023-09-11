import { DailyRouteStatus } from '@root/consts';

export const defaultValues = {
  businessLineTypes: undefined,
  serviceAreaIds: undefined,
  statuses: undefined,
  truckTypes: undefined,
};

export const statusOptions = Object.values(DailyRouteStatus).filter(
  value => value !== DailyRouteStatus.UPDATING,
);
