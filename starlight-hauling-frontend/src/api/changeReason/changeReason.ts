import { IChangeReason } from '@root/types';

import { BaseService } from '../base';

export class ChangeReasonService extends BaseService<IChangeReason> {
  constructor() {
    super('change-reasons');
  }
}
