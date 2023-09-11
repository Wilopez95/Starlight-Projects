import { BaseGraphqlService } from '../base';

import { type IMasterRouteResponse, type IMasterRouteVariables } from './types';

export class MasterRouteService extends BaseGraphqlService {
  constructor() {
    super('route-planner');
  }

  request(variables: IMasterRouteVariables) {
    return this.graphql<IMasterRouteResponse>(
      `query getMasterRoutes($businessUnitId: Int!, $input: MasterRouteFilters!) {
        masterRoutes(businessUnitId: $businessUnitId, input: $input) {
          id
          serviceDaysList
          name
          color
          status
          numberOfStops
          serviceItems {
            id
            jobSite {
              coordinates
            }
          }
          createdAt
          updatedAt
        }
      }`,
      variables,
    );
  }
}
