import { observable } from 'mobx';

import { ILandfillOperationStore, IStoreCount } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

export class LandfillOperationStore extends BaseStore<ILandfillOperationStore> {
  @observable counts?: IStoreCount;

  constructor(global: GlobalStore) {
    super(global);
    this.counts = undefined;
  }
}
