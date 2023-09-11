import { ICustomerJobSitePair, IProject } from '@root/types';

import { IFormModal } from '../types';

export interface IProjectModal extends IFormModal<IProject> {
  project?: IProject;
  linkedData?: ICustomerJobSitePair;
  locked?: {
    poRequired?: boolean;
    permitRequired?: boolean;
  };
}
