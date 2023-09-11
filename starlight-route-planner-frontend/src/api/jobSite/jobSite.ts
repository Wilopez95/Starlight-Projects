import { JobSiteStoreCount } from '@root/stores/jobSite/types';
import { IJobSite } from '@root/types';

import { BaseService } from '../base';

export class JobSiteService extends BaseService<IJobSite, IJobSite, JobSiteStoreCount> {
  constructor() {
    super('job-sites');
  }
}
