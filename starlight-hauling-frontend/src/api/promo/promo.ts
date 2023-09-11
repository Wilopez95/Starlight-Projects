import { IPromo } from '@root/types';

import { BaseService } from '../base';

export class PromoService extends BaseService<IPromo> {
  constructor() {
    super('promos');
  }
}
