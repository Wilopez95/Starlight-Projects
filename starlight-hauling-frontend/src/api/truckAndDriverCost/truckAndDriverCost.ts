import { ITruckAndDriverCost } from '@root/types';

import { BaseService } from '../base';

export class TruckAndDriverCostService extends BaseService<ITruckAndDriverCost> {
  constructor() {
    super('operating-costs/truck-driver-costs');
  }
}
