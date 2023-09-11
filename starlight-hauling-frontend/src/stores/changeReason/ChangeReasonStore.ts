import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { ChangeReasonService } from '@root/api';
import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { IChangeReasonFormData } from '@root/quickViews/ChangeReasonQuickView/types';
import GlobalStore from '@root/stores/GlobalStore';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';

import { ChangeReason } from './ChangeReason';

export class ChangeReasonStore extends ConfigurationDataBaseStore<ChangeReason> {
  private readonly service: ChangeReasonService;

  constructor(global: GlobalStore) {
    super(global, ['description']);

    this.service = new ChangeReasonService();
  }

  @actionAsync
  async request(options: RequestQueryParams = {}) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const changeReasonsResponse = await task(this.service.get(options));

      this.validateLoading(changeReasonsResponse, this.limit);

      const changeReasons = changeReasonsResponse.map(
        changeReason => new ChangeReason(this, changeReason),
      );

      this.setItems(changeReasons);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Reason',
        data: options,
        message: `Reasons Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IChangeReasonFormData) {
    try {
      await task(this.service.create(data));

      NotificationHelper.success('create', 'Reason');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Reason');
      Sentry.addBreadcrumb({
        category: 'Reason',
        data,
        message: `Reason Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async update(data: IChangeReasonFormData) {
    try {
      await task(this.service.update(data.id, data));

      NotificationHelper.success('update', 'Reason');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Reason');
      Sentry.addBreadcrumb({
        category: 'Reason',
        data,
        message: `Reason Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
