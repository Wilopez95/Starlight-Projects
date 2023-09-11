import { IMasterRoute } from '@root/stores/masterRoute/types';

import { GraphqlVariables } from '../base';

export interface IMasterRouteVariables extends GraphqlVariables {
  businessUnitId: number;
  input: {
    businessLineTypes?: BusinessLineShortType[];
    serviceAreaIds?: number[];
    serviceDay?: number;
    published?: boolean;
  };
}

export type BusinessLineShortType = 'C' | 'R' | 'CR' | 'PT';
export interface IMasterRouteResponse {
  masterRoutes: IMasterRoute[];
}
