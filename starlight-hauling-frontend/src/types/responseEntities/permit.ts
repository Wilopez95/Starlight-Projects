import { IJobSite } from '../entities';
import { IPermit } from '../entities/permit';

export interface IResponsePermit extends IPermit {
  jobSite: IJobSite;
}
