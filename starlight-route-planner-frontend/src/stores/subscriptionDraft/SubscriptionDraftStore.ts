import { observable } from 'mobx';

import { IHaulingDraftSubscription, IStoreCount } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

export class SubscriptionDraftStore extends BaseStore<IHaulingDraftSubscription> {
  @observable allCounts?: IStoreCount;
  @observable myCounts?: IStoreCount;

  constructor(global: GlobalStore) {
    super(global);
    this.allCounts = undefined;
    this.myCounts = undefined;
  }
}
