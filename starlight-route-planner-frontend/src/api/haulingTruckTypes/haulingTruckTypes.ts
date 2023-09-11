import { HaulingTruckTypeFragment } from '@root/graphql';
import { IHaulingTruckType } from '@root/types';

import { BaseGraphqlService } from '../base';

export class HaulingTrucksTypesService extends BaseGraphqlService {
  getHaulingTruckTypes() {
    return this.graphql<{ haulingTruckTypes: IHaulingTruckType[] }>(
      `
      query HaulingTruckTypes {
        haulingTruckTypes {
          ${HaulingTruckTypeFragment}
        }
      }
    `,
    );
  }
}
