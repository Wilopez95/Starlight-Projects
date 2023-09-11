import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { HaulingTrucksService } from '@root/api';
import { BusinessLineTypeSymbol } from '@root/consts';
import { ExpandedError } from '@root/helpers';
import { IHaulingTruck } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { HaulingTruckItem } from './HaulingTruckItem';

export class HaulingTruckStore extends BaseStore<IHaulingTruck> {
  private readonly service: HaulingTrucksService;
  @observable truckInfo: IHaulingTruck | null;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new HaulingTrucksService();
    this.truckInfo = null;
  }

  @action
  setTruck(truck: IHaulingTruck) {
    this.truckInfo = truck;
  }

  @action
  cleanTruck() {
    this.truckInfo = null;
  }

  getDropdownOptions(inactiveTruck?: boolean) {
    const trucks: IHaulingTruck[] = [];

    if (!inactiveTruck && this.truckInfo) {
      // Prevent duplication
      if (!this.getById(this.truckInfo.id)) {
        trucks.push(this.truckInfo);
      }
    }

    trucks.push(...this.values);

    return trucks.map(truck => ({
      // this should stay as string to simplify fe/be communication
      value: truck.id.toString(),
      label: truck.name,
      hint: truck.businessLineTypes?.join(', '),
    }));
  }

  @actionAsync
  async getHaulingTrucks(businessUnitId: number, businessLineTypes?: BusinessLineTypeSymbol[]) {
    try {
      this.loading = true;

      if (this.values.length) {
        this.cleanup();
      }

      const { haulingTrucks } = await task(
        this.service.getHaulingTrucks(businessUnitId, businessLineTypes),
      );

      if (haulingTrucks.length) {
        this.setItems(haulingTrucks.map(haulingTruck => new HaulingTruckItem(this, haulingTruck)));
      }
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'trucks' });
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async getHaulingTruck(id: number) {
    try {
      this.loading = true;

      const storedTruck = this.getById(id);

      if (storedTruck) {
        this.setTruck(storedTruck);

        return storedTruck;
      }

      const { haulingTruck } = await task(this.service.getHaulingTruck(id));

      const truck = new HaulingTruckItem(this, haulingTruck);

      this.setTruck(truck);

      return truck;
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'trucks' });
    } finally {
      this.loading = false;
    }
  }
}
