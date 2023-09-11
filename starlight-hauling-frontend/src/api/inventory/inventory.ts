import { type IInventory } from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

import { type IUpdateInventoryRequest } from './types';

export class InventoryService extends BaseService<IInventory, IInventory> {
  constructor() {
    super('inventory');
  }

  getInventory(businessUnitId: string, businessLineId: string) {
    return haulingHttpClient.get<IInventory[]>(
      `${this.baseUrl}/${businessUnitId}?businessLineId=${businessLineId}`,
    );
  }

  updateInventory(businessUnitId: string, data: IUpdateInventoryRequest) {
    return haulingHttpClient.put<IUpdateInventoryRequest, IInventory[]>({
      url: `${this.baseUrl}/${businessUnitId}`,
      data,
    });
  }
}
