import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { IDriverFormikData } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { DriverService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { Driver } from './Driver';

export class DriverStore extends ConfigurationDataBaseStore<Driver> {
  private readonly service: DriverService;

  constructor(global: GlobalStore) {
    super(global, ['description']);

    this.service = new DriverService();
  }

  @actionAsync
  async request(options: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const driversResponse = await task(
        this.service.get({
          limit: this.limit,
          skip: this.offset,
          sortOrder: this.sortOrder,
          sortBy: this.sortBy,
          activeOnly: !this.globalStore.systemConfigurationStore.showInactive,
          ...options,
        }),
      );

      this.validateLoading(driversResponse, this.limit);

      this.setItems(driversResponse.map(driverType => new Driver(this, driverType)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Driver',
        message: `Drivers Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestAll(options: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const driversResponse = await task(
        this.service.getAllDrivers({
          ...options,
        }),
      );

      const drivers = driversResponse.map(driver => new Driver(this, driver));

      this.setItems(drivers);

      return drivers;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Driver',
        message: `Drivers Request Request All Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async requestById(id: number, skipSelectEntity = false) {
    this.loading = true;
    try {
      const driver = await task(this.service.getById(id));

      const newDriver = new Driver(this, driver);

      if (!skipSelectEntity) {
        this.selectEntity(newDriver);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Driver',
        message: `Drivers Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async create(data: IDriverFormikData) {
    this.loading = true;
    if (data.photoUrl?.length === 0 && data.image === null) {
      data.photoUrl = null;
    }

    if (data.image && data.image instanceof File) {
      data.photoUrl = undefined;
    }

    try {
      const newEntity = await task(this.service.createDriverWithImage(data));
      const newDriver = new Driver(this, newEntity);

      this.setItem(newDriver);
      NotificationHelper.success('create', 'Driver');

      return newDriver;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (typedError.response.code === ActionCode.CONFLICT) {
        NotificationHelper.error('create', ActionCode.CONFLICT, 'Driver');
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Driver');
      }
      Sentry.addBreadcrumb({
        category: 'Driver',
        message: `Drivers Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(data: IDriverFormikData) {
    this.loading = true;

    if (data.photoUrl?.length === 0 && data.image === null) {
      data.photoUrl = null;
    }

    if (data.image && data.image instanceof File) {
      data.photoUrl = undefined;
    }

    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(this.service.updateDriverWithImage(data.id, data));

      this.setItem(new Driver(this, newEntity));
      NotificationHelper.success('update', 'Driver');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(data.id));
      }
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Driver');
      Sentry.addBreadcrumb({
        category: 'Driver',
        message: `Drivers Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }
}
