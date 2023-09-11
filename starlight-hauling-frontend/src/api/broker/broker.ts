import { IBroker } from '@root/types';

import { BaseService } from '../base';

export class BrokerService extends BaseService<IBroker> {
  constructor() {
    super('brokers');
  }
}
