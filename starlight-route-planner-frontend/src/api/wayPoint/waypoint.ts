import { WayPointFragment } from '@root/graphql';
import { IWayPoint } from '@root/types';

import { BaseGraphqlService } from '../base';

export class WayPointService extends BaseGraphqlService {
  getWayPointsList() {
    return this.graphql<{ haulingDisposalSites: IWayPoint[] }>(`
      query ListHaulingDisposalSites($onlyLandfills: Boolean) {
        haulingDisposalSites(onlyLandfills: $onlyLandfills) {
          ${WayPointFragment}
        }
      }
    `);
  }
}
