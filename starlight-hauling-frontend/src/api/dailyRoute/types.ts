import { IDailyRoute } from '@root/types/entities/dailyRoute';

import { GraphqlVariables } from '../base';
import { BusinessLineShortType } from '../masterRoute/types';

export interface IDailyRouteVariables extends GraphqlVariables {
  businessUnitId: number;
  input: {
    serviceDate: string; // YYYY-MM-DD
    businessLineTypes?: BusinessLineShortType[];
    serviceAreaIds: number[];
  };
}

export interface IDailyRouteResponse {
  dailyRoutes: IDailyRoute[];
}
