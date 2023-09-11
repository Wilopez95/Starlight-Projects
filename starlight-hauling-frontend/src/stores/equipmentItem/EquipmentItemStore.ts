import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { EquipmentItemWithImage } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { EquipmentItemService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { EquipmentItem } from './EquipmentItem';

export class EquipmentItemStore extends ConfigurationDataBaseStore<EquipmentItem> {
  private readonly service: EquipmentItemService;

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new EquipmentItemService();
  }

  @actionAsync
  async request(options: RequestQueryParams = {}) {
    this.loading = true;
    this.cleanup();
    try {
      const equipmentResponse = await task(this.service.get(options));
      this.setItems(equipmentResponse.map(equipmentItem => new EquipmentItem(this, equipmentItem)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'EquipmentItem',
        data: {
          ...options,
        },
        message: `Equipment Items Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async create(data: EquipmentItemWithImage) {
    if (data.imageUrl?.length === 0 && data.image === null) {
      data.imageUrl = null;
    }

    if (data.image && data.image instanceof File) {
      data.imageUrl = undefined;
    }

    try {
      const newEquipmentItem = await task(this.service.createEquipmentItemWithImage(data));

      this.setItem(new EquipmentItem(this, newEquipmentItem));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Equipment');
      Sentry.addBreadcrumb({
        category: 'EquipmentItem',
        data: {
          ...data,
        },
        message: `Equipment Items Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const equipmentItem = new EquipmentItem(this, response);

      this.setItem(equipmentItem);
      this.selectEntity(equipmentItem);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'EquipmentItem',
        data: {
          id,
        },
        message: `Equipment Items Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return this.getById(id);
  }

  @actionAsync
  async update(data: EquipmentItemWithImage) {
    if (data.imageUrl?.length === 0 && data.image === null) {
      data.imageUrl = null;
    }

    if (data.image && data.image instanceof File) {
      data.imageUrl = undefined;
    }

    try {
      this.clearPreconditionFailedError();
      const newEquipmentItem = await task(this.service.updateEquipmentItemWithImage(data.id, data));

      this.setItem(new EquipmentItem(this, newEquipmentItem));
      NotificationHelper.success('update', 'Equipment');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(data.id));
      }
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Equipment');
      Sentry.addBreadcrumb({
        category: 'EquipmentItem',
        data: {
          ...data,
        },
        message: `Equipment Items Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
