import { IOrderCount } from '@root/types';
import { observable } from 'mobx';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { OrderStoreCount } from './types';

export class OrderStore extends BaseStore<IOrderCount> {
  @observable allCounts?: OrderStoreCount;
  @observable myCounts?: OrderStoreCount;

  constructor(global: GlobalStore) {
    super(global);
    this.allCounts = undefined;
    this.myCounts = undefined;
  }

  getCounts(mine: boolean) {
    return mine ? this.myCounts : this.allCounts;
  }
}
