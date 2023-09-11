import orderBy from 'lodash-es/orderBy';
import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { HaulingDriversService } from '@root/api';
import { ExpandedError } from '@root/helpers';
import { IHaulingDriver } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { HaulingDriverItem } from './HaulingDriver';

export class HaulingDriverStore extends BaseStore<IHaulingDriver> {
  private readonly service: HaulingDriversService;
  @observable driverInfo: IHaulingDriver | null;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new HaulingDriversService();
    this.driverInfo = null;
  }

  @action
  setDriver(driver: IHaulingDriver) {
    this.driverInfo = driver;
  }

  @action
  cleanDriver() {
    this.driverInfo = null;
  }

  getDropdownOptions(selectedTruckId?: string | null, inactiveDriver?: boolean) {
    if (!selectedTruckId) {
      return [];
    }

    const drivers: IHaulingDriver[] = [];

    if (!inactiveDriver && this.driverInfo) {
      // Prevent duplication
      if (!this.getById(this.driverInfo.id)) {
        drivers.push(this.driverInfo);
      }
    }

    const sortedDrivers = orderBy(this.values, [el => el.truckId === +selectedTruckId], 'desc');

    drivers.push(...sortedDrivers);

    return drivers.map(driver => ({
      value: driver.id,
      label: driver.name ? driver.name : '',
      hint: driver.truckId === +selectedTruckId ? 'default' : '',
    }));
  }

  @actionAsync
  async getHaulingDrivers(businessUnitId: number, truckId?: number) {
    try {
      this.loading = true;

      if (this.values.length) {
        this.cleanup();
      }

      const { haulingDrivers } = await task(
        this.service.getHaulingDrivers(businessUnitId, truckId),
      );

      if (haulingDrivers.length) {
        this.setItems(
          haulingDrivers.map(haulingDriver => new HaulingDriverItem(this, haulingDriver)),
        );
      }
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'drivers' });
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async getHaulingDriver(id: number) {
    try {
      this.loading = true;

      const storedDriver = this.getById(id);

      if (storedDriver) {
        this.setDriver(storedDriver);

        return storedDriver;
      }

      const { haulingDriver } = await task(this.service.getHaulingDriver(id));

      const driver = new HaulingDriverItem(this, haulingDriver);

      this.setDriver(driver);

      return driver;
    } catch (error) {
      ExpandedError.sentryWithNotification({ error, action: 'drivers' });
    } finally {
      this.loading = false;
    }
  }
}
