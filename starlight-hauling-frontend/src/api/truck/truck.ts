import { ITruck } from '@root/types';

import { BaseService, haulingHttpClient, RequestQueryParams } from '../base';

export class TruckService extends BaseService<ITruck> {
  constructor() {
    super('trucks');
  }

  getAllTrucks(options: RequestQueryParams = {}) {
    return haulingHttpClient.get<ITruck[]>(`${this.baseUrl}/all`, options);
  }
}
