import { IPermit } from '@root/types';
import { IResponsePermit } from '@root/types/responseEntities';

import { BaseService } from '../base';

export class PermitService extends BaseService<IPermit, IResponsePermit> {
  constructor() {
    super('permits');
  }
}
