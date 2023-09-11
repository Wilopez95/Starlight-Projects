import { IBillableService, IFrequency } from '@root/types';

import { BaseService, haulingHttpClient, RequestQueryParams } from '../base';

export class BillableItemService extends BaseService<IBillableService> {
  constructor() {
    super('billable/services');
  }

  getFrequencies(id: number, options: RequestQueryParams) {
    return haulingHttpClient.get<IFrequency[]>(`${this.baseUrl}/${id}/frequencies`, options);
  }

  getFrequenciesByService(query: string, options: RequestQueryParams = {}) {
    return haulingHttpClient.get<IBillableService[]>(`billable/services?${query}`, options);
  }
}
