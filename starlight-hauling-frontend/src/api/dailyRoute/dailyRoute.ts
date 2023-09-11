import { BaseGraphqlService } from '../base';

import { type IDailyRouteResponse, type IDailyRouteVariables } from './types';

export class DailyRouteService extends BaseGraphqlService {
  constructor() {
    super('route-planner');
  }

  request(variables: IDailyRouteVariables) {
    return this.graphql<IDailyRouteResponse>(
      `query getDailyRoutes($businessUnitId: Int!, $input: DailyRouteFilters!) {
        dailyRoutes(businessUnitId: $businessUnitId, input: $input) {
          id
          name
          status
          serviceDate
          editingBy
          createdAt
          updatedAt
        }
      }`,
      variables,
    );
  }
}
