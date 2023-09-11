import { IMaterial } from '@root/types';
import { IResponseMaterial } from '@root/types/responseEntities';

import { BaseService, haulingHttpClient } from '../base';
import { RequestQueryParams } from '../base/types';

export class MaterialService extends BaseService<IMaterial, IResponseMaterial> {
  constructor() {
    super('materials');
  }

  getByEquipmentItem(equipmentItemId: string | number, options?: RequestQueryParams) {
    return haulingHttpClient.get<IResponseMaterial[]>(
      `${this.baseUrl}/by-equipment-item/${equipmentItemId}`,
      options,
    );
  }

  getMaterialHistocal(materialId: number | undefined) {
    return haulingHttpClient.get<IResponseMaterial>(`${this.baseUrl}/historical/${materialId}`);
  }
}
