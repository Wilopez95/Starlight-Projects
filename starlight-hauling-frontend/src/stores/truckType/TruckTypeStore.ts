import * as Sentry from '@sentry/react';
import i18next from 'i18next';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { ITruckFormikData } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { TruckTypeService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { sanitizeFormData } from './sanitize';
import { TruckType } from './TruckType';

export type TruckTypeStoreSortType = 'description' | 'businessLineNames';

export class TruckTypeStore extends ConfigurationDataBaseStore<TruckType> {
  private readonly service: TruckTypeService;

  constructor(global: GlobalStore) {
    super(global, ['description']);

    this.service = new TruckTypeService();
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

      this.setItems(truckTypesResponse.map(truckType => new TruckType(this, truckType)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;

      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TruckType',
        message: `Truck Types Error ${JSON.stringify(typedError?.message)}`,
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
      const truckTypesResponse = await task(
        this.service.getAllTruckTypes({
          ...options,
        }),
      );

      const truckTypes = truckTypesResponse.map(truckType => new TruckType(this, truckType));

      this.setItems(truckTypes);

      return truckTypes;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TruckType',
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
      const truckType = await task(this.service.getById(id));

      const newTruck = new TruckType(this, truckType);

      if (!skipSelectEntity) {
        this.selectEntity(newTruck);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TruckType',
        message: `Truck Types Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async create(data: ITruckFormikData) {
    this.loading = true;
    const sanitizedData = sanitizeFormData(data);

    try {
      const newEntity = await task(this.service.create(sanitizedData));
      const newTruck = new TruckType(this, newEntity);

      this.setItem(newTruck);
      NotificationHelper.success('create', 'Truck Type');

      return newEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Truck Type');
      Sentry.addBreadcrumb({
        category: 'TruckType',
        message: `Truck Types Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...sanitizedData,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(data: ITruckFormikData) {
    this.loading = true;
    const sanitizedData = sanitizeFormData(data);

    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(this.service.update(data.id, sanitizedData));
      const newTruck = new TruckType(this, newEntity);

      this.setItem(newTruck);
      NotificationHelper.success('update', 'Truck Type');

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
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Truck Type');
      }
      Sentry.addBreadcrumb({
        category: 'TruckType',
        message: `Truck Types Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...sanitizedData,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }
}
