import {
  DailyRouteFragment,
  DailyRouteNameFragment,
  RouteEditingNoticeFragment,
  WorkOrderFragment,
  WorkOrderMapItemFragment,
} from '@root/graphql';
import {
  IDailyRoute,
  IDailyRouteEditModeNotice,
  IDailyRouteNamesListParams,
  IDailyRoutesListParams,
} from '@root/types';

import { BaseGraphqlService, routePlannerHttpClient } from '../base';

import { ICreateDailyRouteParams, IUpdateDailyRouteParams } from './types';

export class DailyRoutesService extends BaseGraphqlService {
  static getDailyRoutesList(businessUnitId: number, filters: IDailyRoutesListParams) {
    return routePlannerHttpClient.graphql<
      { dailyRoutes: IDailyRoute[] },
      {
        businessUnitId: number;
        filters: IDailyRoutesListParams;
      }
    >(
      `
        query DailyRoutes($businessUnitId: Int!, $filters: DailyRouteFilters!) {
          dailyRoutes(businessUnitId: $businessUnitId, input: $filters) {
            id
            name
          }
        }
      `,
      { businessUnitId, filters },
    );
  }

  getDailyRouteNamesList(businessUnitId: number, filters: IDailyRouteNamesListParams) {
    return this.graphql<
      { dailyRoutes: { id: number; name: string }[] },
      {
        businessUnitId: number;
        filters: IDailyRouteNamesListParams;
      }
    >(
      `
        query DailyRoutes($businessUnitId: Int!, $filters: DailyRouteFilters!) {
          dailyRoutes(businessUnitId: $businessUnitId, input: $filters) {
            ${DailyRouteNameFragment}
          }
        }
      `,
      {
        businessUnitId,
        filters,
      },
    );
  }

  getDailyRoutesListExpanded(businessUnitId: number, filters: IDailyRoutesListParams) {
    return this.graphql<
      { dailyRoutes: IDailyRoute[] },
      {
        businessUnitId: number;
        filters: IDailyRoutesListParams;
      }
    >(
      `
        query DailyRoutes($businessUnitId: Int!, $filters: DailyRouteFilters!) {
          dailyRoutes(businessUnitId: $businessUnitId, input: $filters) {
            ${DailyRouteFragment}
            workOrders {
              ${WorkOrderMapItemFragment}
            }
          }
        }
      `,
      { businessUnitId, filters },
    );
  }

  createDailyRoute(businessUnitId: number, variables: ICreateDailyRouteParams) {
    return this.graphql<
      { createDailyRoute: IDailyRoute },
      { businessUnitId: number; variables: ICreateDailyRouteParams }
    >(
      `mutation CreateDailyRoute($businessUnitId: Int!, $variables: CreateDailyRouteInput!) {
        createDailyRoute(businessUnitId: $businessUnitId, input: $variables) {
          ${DailyRouteFragment}
          workOrders {
            ${WorkOrderFragment}
          }
        }
      }`,
      {
        businessUnitId,
        variables,
      },
    );
  }

  updateDailyRoute(variables: IUpdateDailyRouteParams) {
    return this.graphql<{ updateDailyRoute: IDailyRoute }, { variables: IUpdateDailyRouteParams }>(
      `mutation UpdateDailyRoute($variables: UpdateDailyRouteInput!) {
        updateDailyRoute(input: $variables) {
          ${DailyRouteFragment}
          workOrders {
            ${WorkOrderFragment}
          }
        }
      }`,
      {
        variables,
      },
    );
  }

  getAvailableColor() {
    return this.graphql<{ availableDailyRouteColor: { color: string } }>(
      `
        query AvailableDailyRouteColor {
          availableDailyRouteColor {
            color
          }
        }
      `,
    );
  }

  getCount(businessUnitId: number, serviceDate: string) {
    return this.graphql<
      { dailyRoutesCount: { count: number } },
      { businessUnitId: number; serviceDate: string }
    >(
      `
        query DailyRoutesCount($businessUnitId: Int!, $serviceDate: String!) {
          dailyRoutesCount(businessUnitId: $businessUnitId, serviceDate: $serviceDate) {
            count
          }
        }
      `,
      {
        businessUnitId,
        serviceDate,
      },
    );
  }

  enableEditMode(id: number) {
    return this.graphql<
      {
        enableDailyRouteEditMode: (IDailyRoute | IDailyRouteEditModeNotice) & {
          __typename: string;
        };
      },
      { id: number }
    >(
      `mutation EnableDailyRouteEditMode($id: Int!) {
        enableDailyRouteEditMode(id: $id) {
          __typename
          ... on EnableEditModeNotice {
            ${RouteEditingNoticeFragment}
          }

          ... on DailyRoute {
            ${DailyRouteFragment}
            workOrders {
              ${WorkOrderMapItemFragment}
            }
          }
        }
      }`,
      {
        id,
      },
    );
  }

  disableEditMode(id: number) {
    return this.graphql<{ disableDailyRouteEditMode: IDailyRoute }, { id: number }>(
      `mutation DisableDailyRouteEditMode($id: Int!) {
        disableDailyRouteEditMode(id: $id) {
          ${DailyRouteFragment}
          workOrders {
            ${WorkOrderMapItemFragment}
          }
        }
      }`,
      {
        id,
      },
    );
  }

  getDailyRoute(id: number) {
    return this.graphql<{ dailyRoute: IDailyRoute }, { id: number }>(
      `query DailyRoute($id: Int!) {
        dailyRoute(id: $id) {
          ${DailyRouteFragment}
          workOrders {
            ${WorkOrderFragment}
          }
        }
      }`,
      {
        id,
      },
    );
  }
}
