import { DailyRouteHistoryFragment } from '@root/graphql/fragments/dailyRouteHistory';
import { IDailyRouteHistory } from '@root/types';

import { BaseGraphqlService } from '../base';

export class DailyRouteHistoryService extends BaseGraphqlService {
  getDailyRouteHistory(id: number) {
    return this.graphql<
      { dailyRouteHistory: IDailyRouteHistory[] | null },
      {
        id: number;
      }
    >(
      `
        query DailyRouteHistory($id: Int!) {
          dailyRouteHistory(id: $id) {
            ${DailyRouteHistoryFragment}
          }
        }
      `,
      { id },
    );
  }
}
