import { ICustomerJobSitePair, IProject } from '@root/types';

import { IForm } from '../types';

export interface IProjectForm extends IForm<IProject> {
  project?: IProject;
  linkedData?: ICustomerJobSitePair;
  locked?: {
    poRequired?: boolean;
    permitRequired?: boolean;
  };
}
