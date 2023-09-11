import { BusinessLineTypeSymbol } from '@root/consts';
import { HaulingTruckFragment } from '@root/graphql';
import { IHaulingTruck } from '@root/types';

import { BaseGraphqlService } from '../base';

export class HaulingTrucksService extends BaseGraphqlService {
  getHaulingTrucks(businessUnitId: number, businessLineTypes?: BusinessLineTypeSymbol[]) {
    return this.graphql<
      { haulingTrucks: IHaulingTruck[] },
      {
        businessUnitId: number;
        businessLineTypes?: BusinessLineTypeSymbol[];
      }
    >(
      `
      query HaulingTrucks($businessUnitId: Int!, $businessLineTypes: [BUSINESS_LINE_ROUTE_TYPE]) {
        haulingTrucks(businessUnitId: $businessUnitId, businessLineTypes: $businessLineTypes) {
          ${HaulingTruckFragment}
        }
      }
    `,
      { businessUnitId, businessLineTypes },
    );
  }

  getHaulingTruck(id: number) {
    return this.graphql<
      { haulingTruck: IHaulingTruck },
      {
        id: number;
      }
    >(
      `
      query HaulingTruck($id: Int!) {
        haulingTruck(id: $id) {
          ${HaulingTruckFragment}
        }
      }
    `,
      { id },
    );
  }
}
