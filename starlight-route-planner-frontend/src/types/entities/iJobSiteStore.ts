import { JobSiteService } from '@root/api';
import { JobSiteStoreCount } from '@root/stores/jobSite/types';
import { IEntity } from './entity';

export interface IJobSiteStore extends IEntity {
  service: JobSiteService;
  counts?: JobSiteStoreCount;
}
