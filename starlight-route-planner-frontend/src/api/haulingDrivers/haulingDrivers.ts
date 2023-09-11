import { HaulingDriverFragment } from '@root/graphql';
import { IHaulingDriver } from '@root/types';

import { BaseGraphqlService } from '../base';

export class HaulingDriversService extends BaseGraphqlService {
  getHaulingDrivers(businessUnitId: number, truckId?: number) {
    return this.graphql<
      { haulingDrivers: IHaulingDriver[] },
      {
        businessUnitId: number;
        truckId?: number;
      }
    >(
      `
      query HaulingDrivers($businessUnitId: Int!, $truckId: Int) {
        haulingDrivers(businessUnitId: $businessUnitId, truckId: $truckId) {
          ${HaulingDriverFragment}
        }
      }
    `,
      { businessUnitId, truckId },
    );
  }

  getHaulingDriver(id: number) {
    return this.graphql<
      { haulingDriver: IHaulingDriver },
      {
        id: number;
      }
    >(
      `
      query HaulingDriver($id: Int!) {
        haulingDriver(id: $id) {
          ${HaulingDriverFragment}
        }
      }
    `,
      { id },
    );
  }
}
