import { IMatchedServiceAreas, IServiceArea } from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { BaseService, haulingHttpClient } from '../base';

export class ServiceAreaService extends BaseService<IServiceArea> {
  constructor() {
    super('service-areas');
  }

  requestByJobSite({
    jobSiteId,
    businessLineId,
    businessUnitId,
    activeOnly,
  }: {
    jobSiteId: number;
    activeOnly: boolean;
  } & IBusinessContextIds) {
    return haulingHttpClient.get<{ jobSiteId: number } & IBusinessContextIds, IMatchedServiceAreas>(
      `${this.baseUrl}/matched`,
      {
        jobSiteId,
        businessLineId,
        businessUnitId,
        activeOnly,
      },
    );
  }
}
