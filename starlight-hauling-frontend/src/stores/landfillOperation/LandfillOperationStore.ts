import * as Sentry from '@sentry/react';
import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { LandfillOperationService } from '@root/api';
import { ApiError } from '@root/api/base/ApiError';
import { ILandfillSyncRequest } from '@root/api/landfillOperation/types';
import { NotificationHelper } from '@root/helpers';
import { IEditableLandfillOperation, ILandfillOperation, IStoreCount } from '@root/types';

import { ActionCode } from '@root/helpers/notifications/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { LandfillOperation } from './LandfillOperation';
import { sanitizeEdit } from './sanitize';
import {
  GetCountOptions,
  ILandfillOperationRequestParams,
  LandfillOperationStoreSortType,
} from './types';

export class LandfillOperationStore extends BaseStore<
  LandfillOperation,
  LandfillOperationStoreSortType
> {
  private service: LandfillOperationService;
  @observable counts?: IStoreCount;

  constructor(global: GlobalStore) {
    super(global, 'id', 'desc');

    this.service = new LandfillOperationService();
  }

  @actionAsync
  async requestCount({ query, businessUnitId, filterData = {} }: GetCountOptions) {
    try {
      const counts = await task(this.service.getCount({ ...filterData, businessUnitId, query }));

      this.counts = counts;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'LandfillOperation',
        message: `Landfill Operations Count Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          query,
          businessUnitId,
          filterData,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async request({ query, businessUnitId, filterData = {} }: ILandfillOperationRequestParams) {
    if (this.loading) {
      return;
    }
    this.loading = true;
    try {
      const response = await task(
        this.service.get({
          limit: this.limit,
          skip: this.offset,
          query,
          businessUnitId,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          ...filterData,
        }),
      );

      this.validateLoading(response, this.limit);
      this.setItems(response.map(landfill => new LandfillOperation(this, landfill)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      Sentry.addBreadcrumb({
        category: 'LandfillOperation',
        message: `Landfill Operations Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          query,
          businessUnitId,
          filterData,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const landfill = await task(this.service.getById(id));
      const landfillEntity = new LandfillOperation(this, landfill);

      this.setItem(landfillEntity);

      this.updateSelectedEntity(landfillEntity);

      this.loading = false;

      return landfillEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Landfill',
        data: {
          id,
        },
        message: `Landfill Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return null;
  }

  @actionAsync
  async sync(options: ILandfillSyncRequest) {
    try {
      const syncedLandfillOperationResponse = await task(this.service.sync(options));

      const syncedLandfill = new LandfillOperation(this, syncedLandfillOperationResponse);

      this.setItem(syncedLandfill);
      this.selectEntity(syncedLandfill);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.custom('error', typedError?.message);
      Sentry.addBreadcrumb({
        category: 'LandfillOperation',
        message: `Landfill Operations Sync Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async edit(data: IEditableLandfillOperation) {
    try {
      const sanitizedData: unknown = sanitizeEdit(data);
      const response = await task(this.service.edit(data.id, sanitizedData as ILandfillOperation));

      const updatedLandfill = new LandfillOperation(this, response);

      this.setItem(updatedLandfill);
      this.toggleQuickView(false);

      NotificationHelper.success('update', 'Landfill Operation');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      if (typedError instanceof ApiError && typedError.statusCode === 409) {
        this.toggleQuickView(false);
        NotificationHelper.custom('error', typedError.response?.message);

        return;
      }

      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'LandfillOperation',
        message: `Landfill Operations Edit Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
  }
}
