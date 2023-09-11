import { JobSite } from '@root/stores/entities';

import { IForm } from '../types';

export type FormikLinkJobSite = {
  jobSiteId?: number;
  searchString: string;
};

export interface ILinkJobSiteForm extends IForm<FormikLinkJobSite> {
  onJobSiteCreated(jobSite: JobSite): void;
}
