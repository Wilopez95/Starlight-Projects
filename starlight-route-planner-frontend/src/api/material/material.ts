import { MaterialItemFragment } from '@root/graphql';
import { IMaterial } from '@root/types';

import { BaseGraphqlService } from '../base';

import { IHaulingMaterialFilters } from './types';

export class MaterialService extends BaseGraphqlService {
  getHaulingMaterials(haulingMaterialFilters: IHaulingMaterialFilters) {
    return this.graphql<
      { haulingMaterials: IMaterial[] },
      {
        haulingMaterialFilters: IHaulingMaterialFilters;
      }
    >(
      `
        query HaulingMaterials($haulingMaterialFilters: HaulingMaterialFilters) {
          haulingMaterials(input: $haulingMaterialFilters) {
            ${MaterialItemFragment}
          }
        }
      `,
      {
        haulingMaterialFilters,
      },
    );
  }
}
