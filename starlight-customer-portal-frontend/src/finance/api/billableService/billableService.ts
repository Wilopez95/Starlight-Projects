import { BaseService, haulingHttpClient, RequestQueryParams } from '@root/core/api/base';
import { IBillableService, IFrequency } from '@root/core/types';

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
