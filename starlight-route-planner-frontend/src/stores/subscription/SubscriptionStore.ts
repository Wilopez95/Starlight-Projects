import { observable } from 'mobx';

import { IHaulingSubscription, IStoreCount } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

export class SubscriptionStore extends BaseStore<IHaulingSubscription> {
  @observable allCounts?: IStoreCount;
  @observable myCounts?: IStoreCount;

  constructor(global: GlobalStore) {
    super(global);
    this.allCounts = undefined;
    this.myCounts = undefined;
  }
}
