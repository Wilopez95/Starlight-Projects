import { ITruckType, ITruckTypeData } from '@root/types';

import { BaseService, haulingHttpClient, RequestQueryParams } from '../base';

export class TruckTypeService extends BaseService<ITruckTypeData, ITruckType> {
  constructor() {
    super('trucks/types');
  }

  getAllTruckTypes(options: RequestQueryParams = {}) {
    return haulingHttpClient.get<ITruckType[]>(`${this.baseUrl}/all`, options);
  }
}
