import { IJobSite } from '@root/types';

export interface ILinkedJobSites {
  customerId?: number;
  onJobSiteSelect(jobSite: IJobSite): void;
}
