import { type IMaterialProfile } from '@root/types';

import { BaseService } from '../base';

export class MaterialProfileService extends BaseService<IMaterialProfile> {
  constructor() {
    super('material-profiles');
  }
}
