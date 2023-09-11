import { IJobSiteData } from '@root/components/forms/JobSite/types';
import { AddressSuggestion } from '@root/types/responseEntities';

import { IFormModal } from '../types';

export interface IJobSiteModal<T> extends IFormModal<T> {
  withMap?: boolean;
  isEditing?: boolean;
  jobSite?: IJobSiteData;
  nonSearchable?: boolean;
  onSelect?(address: AddressSuggestion): void;
}
