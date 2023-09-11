import { WorkOrderMapItemFragment } from '@root/graphql/fragments';
import { IWorkOrder } from '@root/types';

import { BaseGraphqlService } from '../base';

import { ICheckWorkOrdersRouteStatus, IWorkOrdersDailyRouteParams } from './types';

export class WorkOrdersDailyRouteService extends BaseGraphqlService {
  getWorkOrderWithDailyRouteList(id: number, filters: IWorkOrdersDailyRouteParams) {
    return this.graphql<
      { workOrdersDailyRoute: IWorkOrder[] },
      {
        businessUnitId: number;
        filters: IWorkOrdersDailyRouteParams;
      }
    >(
      `
        query WorkOrdersDailyRoute($businessUnitId: Int!, $filters: WorkOrderDailyRouteFilters!) {
          workOrdersDailyRoute(businessUnitId: $businessUnitId, input: $filters) {
            ${WorkOrderMapItemFragment}
          }
        }
      `,
      { businessUnitId: id, filters },
    );
  }

  checkWorkOrdersRouteStatus(ids: number[]) {
    return this.graphql<
      { checkWorkOrdersRouteStatus: ICheckWorkOrdersRouteStatus | null },
      { ids: number[] }
    >(
      `query CheckWorkOrdersRouteStatus($ids: [Int!]!) {
        checkWorkOrdersRouteStatus(ids: $ids) {
          available
          updating
        }
      }`,
      {
        ids,
      },
    );
  }
}
