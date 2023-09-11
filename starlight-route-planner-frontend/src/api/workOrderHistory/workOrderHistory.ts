import { WorkOrderHistoryFragment } from '@root/graphql';
import { IWorkOrderHistory } from '@root/types';

import { BaseGraphqlService } from '../base';

export class WorkOrderHistoryService extends BaseGraphqlService {
  getWorkOrderHistory(id: number) {
    return this.graphql<
      { workOrderHistory: IWorkOrderHistory[] | null },
      {
        id: number;
      }
    >(
      `
        query WorkOrderHistory($id: Int!) {
          workOrderHistory(id: $id) {
            ${WorkOrderHistoryFragment}
          }
        }
      `,
      { id },
    );
  }
}
