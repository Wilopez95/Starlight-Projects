import { IProject } from '@root/types';

import { BaseService, haulingHttpClient, RequestQueryParams } from '../base';

export class ProjectService extends BaseService<IProject> {
  constructor() {
    super('projects');
  }

  requestAll({ customerJobSiteId }: { customerJobSiteId?: number }) {
    return haulingHttpClient.get<{ customerJobSiteId: number }, IProject[]>(`${this.baseUrl}/all`, {
      customerJobSiteId,
    });
  }

  requestByCustomer(params: { customerId: number } & RequestQueryParams) {
    return haulingHttpClient.get<{ customerId: number }, IProject[]>(
      `${this.baseUrl}/customer`,
      params,
    );
  }
}
