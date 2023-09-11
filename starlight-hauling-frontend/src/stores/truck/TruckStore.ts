import * as Sentry from '@sentry/react';
import i18next from 'i18next';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { ITrucksFormikData } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { TruckService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { Truck } from './Truck';

export class TruckStore extends ConfigurationDataBaseStore<Truck> {
  private readonly service: TruckService;

  constructor(global: GlobalStore) {
    super(global, ['description']);

    this.service = new TruckService();
  }

  @actionAsync
  async request(options: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const truckTypesResponse = await task(
        this.service.get({
          limit: this.limit,
          skip: this.offset,
          sortOrder: this.sortOrder,
          sortBy: this.sortBy,
          activeOnly: !this.globalStore.systemConfigurationStore.showInactive,
          ...options,
        }),
      );

      this.validateLoading(truckTypesResponse, this.limit);

      this.setItems(truckTypesResponse.map(truckAndType => new Truck(this, truckAndType)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Truck',
        message: `Truck Error ${JSON.stringify(typedError?.message)}`,
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
      const truckResponse = await task(
        this.service.getAllTrucks({
          ...options,
        }),
      );

      const trucks = truckResponse.map(truck => new Truck(this, truck));

      this.setItems(trucks);

      return trucks;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TruckTypes',
        message: `Truck Types Request All Error ${JSON.stringify(typedError?.message)}`,
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
      const truck = await task(this.service.getById(id));

      const newTruck = new Truck(this, truck);

      if (!skipSelectEntity) {
        this.selectEntity(newTruck);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Truck',
        message: `Truck Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async create(data: ITrucksFormikData) {
    this.loading = true;

    try {
      const newEntity = await task(this.service.create(data));
      const newTruck = new Truck(this, newEntity);

      this.setItem(newTruck);
      NotificationHelper.success('create', 'Truck');

      return newEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Truck');
      Sentry.addBreadcrumb({
        category: 'Truck',
        message: `Truck Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(data: ITrucksFormikData) {
    this.loading = true;

    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(this.service.update(data.id, data));
      const newTruck = new Truck(this, newEntity);

      this.setItem(newTruck);
      NotificationHelper.success('update', 'Truck');

      return newEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(data.id));
      } else if (typedError?.response?.code === ActionCode.INVALID_REQUEST) {
        NotificationHelper.custom('error', i18next.t(typedError?.response?.message));
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Truck');
      }
      Sentry.addBreadcrumb({
        category: 'Truck',
        message: `Truck Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }
}
