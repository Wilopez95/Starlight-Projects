import { FormikLinkJobSite } from '@root/components/forms/LinkJobSite/types';
import { JobSite } from '@root/stores/entities';

import { IFormModal } from '../types';

export interface ILinkJobSiteModal extends IFormModal<FormikLinkJobSite> {
  onJobSiteCreate(jobsite: JobSite): void;
}
