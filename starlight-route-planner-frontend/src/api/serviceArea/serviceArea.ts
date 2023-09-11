import { ServiceAreaFragment } from '@root/graphql';
import { IServiceArea } from '@root/types';

import { BaseGraphqlService } from '../base';

export class ServiceAreaService extends BaseGraphqlService {
  getHaulingServiceAreas(businessUnitId: number, businessLineIds: number[]) {
    return this.graphql<
      { haulingServiceAreas: IServiceArea[] },
      {
        businessUnitId: number;
        businessLineIds: number[];
      }
    >(
      `
        query HaulingServiceAreas($businessUnitId: Int!, $businessLineIds: [Int!]!) {
          haulingServiceAreas(businessUnitId: $businessUnitId, businessLineIds: $businessLineIds) {
            ${ServiceAreaFragment}
          }
        }
      `,
      {
        businessUnitId,
        businessLineIds,
      },
    );
  }
}
