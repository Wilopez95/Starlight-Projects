import { action, computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ExpandedError } from '@root/helpers';
import { type I3pHauler } from '@root/types';

import { HaulerService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { HaulerItem } from './3pHauler';

export class HaulerStore extends BaseStore<I3pHauler> {
  private readonly service: HaulerService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new HaulerService();
  }

  @actionAsync
  async getHaulerItems() {
    this.loading = true;

    try {
      const { hauling3rdPartyHaulers } = await task(this.service.getHaulerItems());

      this.setItems(hauling3rdPartyHaulers.map(haulerItem => new HaulerItem(this, haulerItem)));
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'getHaulerItems' });
    } finally {
      this.loading = false;
    }
  }

  @action
  getActiveHaulerValue(thirdPartyHaulerId?: number) {
    const haulerItem = this.getById(thirdPartyHaulerId);

    return haulerItem?.description ?? undefined;
  }

  @computed
  get getHaulerOptions() {
    return this.values.map(({ id, description }) => ({
      label: description,
      value: id,
    }));
  }
}
