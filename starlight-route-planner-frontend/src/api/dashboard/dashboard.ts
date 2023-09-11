import { DashboardFragment, WorkOrderDashboardFragment, WorkOrderFragment } from '@root/graphql';
import { IDailyRouteReport } from '@root/types';
import { IDashboardDailyRoute } from '@root/types/entities/dashboard';

import { BaseGraphqlService } from '../base';

import { IUpdateDashboardDailyRouteRequestParams } from '.';
import { IDashboardParams } from './types';

export class DashboardService extends BaseGraphqlService {
  getDashboardList(id: number, filters: IDashboardParams, searchInput?: string) {
    return this.graphql<
      { dailyRoutesDashboard: IDashboardDailyRoute[] },
      {
        businessUnitId: number;
        filters: IDashboardParams;
        searchInput?: string;
      }
    >(
      `
      query DailyRoutesDashboard($businessUnitId: Int!, $filters: DailyRouteForDashboardFilters!, $searchInput: String) {
        dailyRoutesDashboard(businessUnitId: $businessUnitId, input: $filters, searchInput: $searchInput) {
          ${DashboardFragment}
          workOrders {
            ${WorkOrderDashboardFragment}
          }
        }
      }
    `,
      { businessUnitId: id, filters, searchInput },
    );
  }

  updateDashboardDailyRoute(id: number, input: IUpdateDashboardDailyRouteRequestParams) {
    return this.graphql<
      { updateDailyRouteQuickViewInfo: IDashboardDailyRoute },
      {
        id: number;
        input: IUpdateDashboardDailyRouteRequestParams;
      }
    >(
      `
      mutation UpdateDailyRouteQuickViewInfo($id: Int!, $input: UpdateDailyRouteQuickViewInput!) {
        updateDailyRouteQuickViewInfo(id: $id, input: $input) {
          ${DashboardFragment}
          workOrders {
            ${WorkOrderDashboardFragment}
          }
        }
      }
    `,
      { id, input },
    );
  }

  getDailyRoute(id: number) {
    return this.graphql<{ dailyRoute: IDashboardDailyRoute }, { id: number }>(
      `query DailyRoute($id: Int!) {
        dailyRoute(id: $id) {
          ${DashboardFragment}
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

  getDailyRouteReport(dailyRouteId: number) {
    return this.graphql<{ dailyRouteReport: IDailyRouteReport }, { dailyRouteId: number }>(
      `query GetDailyRouteReport($dailyRouteId: Int!) {
        dailyRouteReport(dailyRouteId: $dailyRouteId) {
          pdfUrl
        }
      }`,
      {
        dailyRouteId,
      },
    );
  }
}
