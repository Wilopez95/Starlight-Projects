import { EquipmentItemFragment } from '@root/graphql';
import { IEquipmentItem } from '@root/types';

import { BaseGraphqlService } from '../base';

export class EquipmentItemService extends BaseGraphqlService {
  getHaulingEquipmentItems(businessLineId: number) {
    return this.graphql<
      { haulingEquipmentItems: IEquipmentItem[] },
      {
        businessLineId: number;
      }
    >(
      `
        query HaulingEquipmentItems($businessLineId: Int!) {
          haulingEquipmentItems(businessLineId: $businessLineId) {
            ${EquipmentItemFragment}
          }
        }
      `,
      {
        businessLineId,
      },
    );
  }
}
