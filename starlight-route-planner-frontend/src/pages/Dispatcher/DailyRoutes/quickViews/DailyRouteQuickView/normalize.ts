import { format } from 'date-fns';
import { pick } from 'lodash-es';

import { ICreateDailyRouteParams, IUpdateDailyRouteParams } from '@root/api/dailyRoutes/types';
import { DateFormat } from '@root/consts';

import { FormDataType } from './formikData';

const SHARED_PARAMS = ['name', 'workOrderIds', 'truckId', 'driverId'];

const CREATE_DAILY_ROUTE_PARAMS = [...SHARED_PARAMS, 'serviceDate', 'color'];

const UPDATE_DAILY_ROUTE_PARAMS = [...SHARED_PARAMS, 'id'];

export const normalizeCreateDailyRoute = (values: FormDataType) => {
  return {
    ...pick(values, CREATE_DAILY_ROUTE_PARAMS),
    workOrderIds: values.workOrders.map(workOrder => workOrder.id),
    serviceDate: format(values.serviceDate, DateFormat.DateSerialized),
  } as ICreateDailyRouteParams;
};

export const normalizeUpdateDailyRoute = (values: FormDataType) => {
  return {
    ...pick(values, UPDATE_DAILY_ROUTE_PARAMS),
    workOrderIds: values.workOrders.map(workOrder => workOrder.id),
  } as IUpdateDailyRouteParams;
};
