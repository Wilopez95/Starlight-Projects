import { pick } from 'lodash-es';

import { ICreateMasterRouteParams, IUpdateMasterRouteParams } from '@root/api/masterRoutes/types';

import { IMasterRouteCustomizedFormValues } from './types';

const MASTER_ROUTE_SERVICE_ITEMS_PARAMS = Object.freeze([
  'id',
  'serviceFrequencyId',
  'jobSiteId',
  'businessLineId',
  'materialId',
  'subscriptionId',
  'businessUnitId',
  'billableServiceId',
  'billableServiceDescription',
  'startDate',
  'endDate',
  'serviceAreaId',
  'equipmentItemId',
  'bestTimeToComeFrom',
  'bestTimeToComeTo',
  'serviceDaysOfWeek',
  'customerId',
]);

const MASTER_ROUTE_PARAMS = Object.freeze(['name', 'truckId', 'driverId', 'serviceDaysList']);

export const normalizeServiceItems = (
  formData: IMasterRouteCustomizedFormValues,
  isEdited: boolean,
) => {
  return {
    ...pick(formData, [...MASTER_ROUTE_PARAMS, ...(isEdited ? [] : ['color'])]),
    serviceItems: formData.serviceItems.map(serviceItem => {
      return {
        ...pick(serviceItem, MASTER_ROUTE_SERVICE_ITEMS_PARAMS),
      };
    }),
  } as ICreateMasterRouteParams | IUpdateMasterRouteParams;
};
