import * as Sentry from '@sentry/react';
import i18next from 'i18next';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { ITruckAndDriverCost } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { TruckAndDriverCostService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { TruckAndDriverCost } from './TruckAndDriverCosts';
import { IRequestByBusinessUnitOrDate } from './types';

export class TruckAndDriverCostStore extends ConfigurationDataBaseStore<TruckAndDriverCost> {
  private readonly service: TruckAndDriverCostService;

  constructor(global: GlobalStore) {
    super(global, [{ key: 'date', order: 'desc' }]);
    this.service = new TruckAndDriverCostService();
  }

  @actionAsync
  async request(options: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const truckAndDriverCostResponse = await task(
        this.service.get({
          skip: this.offset,
          limit: this.limit,
          ...options,
        }),
      );

      this.validateLoading(truckAndDriverCostResponse, this.limit);
      this.setItems(
        truckAndDriverCostResponse.map(
          truckAndDriverCosts => new TruckAndDriverCost(this, truckAndDriverCosts),
        ),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TrucksAndDriversCosts',
        message: `Trucks and Drivers Costs Error ${JSON.stringify(typedError?.message)}`,
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
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const truckAndDriverCosts = new TruckAndDriverCost(this, response);

      this.setItem(truckAndDriverCosts);
      this.selectEntity(truckAndDriverCosts);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TrucksAndDriversCosts',
        data: {
          id,
        },
        message: `Trucks and Drivers Costs Request By Id Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async requestByBusinessUnitOrDate(options: IRequestByBusinessUnitOrDate) {
    this.loading = true;
    try {
      const truckAndDriverCostResponse = await task(this.service.get(options));
      const newTruckAndDriver = truckAndDriverCostResponse[0];

      if (!newTruckAndDriver) {
        return null;
      }

      const newTruckAndDriverEntity = new TruckAndDriverCost(this, newTruckAndDriver);

      this.selectEntity(newTruckAndDriverEntity);

      return newTruckAndDriverEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TrucksAndDriversCosts',
        message: `Truck and Driver Costs Error ${JSON.stringify(typedError?.message)}`,
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
  async create(data: ITruckAndDriverCost) {
    this.loading = true;

    try {
      const newEntity = await task(this.service.create(data));
      const newTruckAndDriverCost = new TruckAndDriverCost(this, newEntity);

      this.setItem(newTruckAndDriverCost);
      NotificationHelper.success('create', 'Truck and Driver Costs');

      return newEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Truck and Driver Costs',
      );
      Sentry.addBreadcrumb({
        category: 'TrucksAndDriversCosts',
        message: `Truck and Driver Cost Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(data: ITruckAndDriverCost) {
    this.loading = true;

    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(this.service.update(data.id, data));
      const newTruckAndDriverCost = new TruckAndDriverCost(this, newEntity);

      this.setItem(newTruckAndDriverCost);
      NotificationHelper.success('update', 'Truck and Driver Costs');

      return newEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (typedError?.response?.code === ActionCode.INVALID_REQUEST) {
        NotificationHelper.custom('error', i18next.t(typedError?.response?.message));
      } else {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      }
      Sentry.addBreadcrumb({
        category: 'TrucksAndDriversCosts',
        message: `Truck and Driver Costs Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }
}
