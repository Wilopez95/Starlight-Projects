import { computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { HaulingTrucksTypesService } from '@root/api';
import { ExpandedError } from '@root/helpers';
import { IHaulingTruckType } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { HaulingTruckTypeItem } from './HaulingTruckType';

export class HaulingTruckTypeStore extends BaseStore<IHaulingTruckType> {
  private readonly service: HaulingTrucksTypesService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new HaulingTrucksTypesService();
  }

  @actionAsync
  async getTruckTypes() {
    try {
      this.loading = true;

      const { haulingTruckTypes } = await task(this.service.getHaulingTruckTypes());

      if (haulingTruckTypes.length) {
        this.setItems(
          haulingTruckTypes.map(
            haulingTruckType => new HaulingTruckTypeItem(this, haulingTruckType),
          ),
        );
      }
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'truckTypes' });
    } finally {
      this.loading = false;
    }
  }

  @computed
  get getDropdownOptions() {
    return this.values.map(({ description }) => ({
      label: description,
      value: description,
    }));
  }
}
