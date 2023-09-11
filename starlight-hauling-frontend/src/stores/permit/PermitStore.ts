import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { type IBusinessContextIds, type IPermit } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { PermitService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { Permit } from './Permit';

export class PermitStore extends ConfigurationDataBaseStore<Permit> {
  private readonly service: PermitService;

  constructor(global: GlobalStore) {
    super(global, ['number']);
    this.service = new PermitService();
  }

  @actionAsync
  async request({
    businessUnitId,
    businessLineId,
    activeOnly,
    excludeExpired,
  }: { excludeExpired?: boolean } & IBusinessContextIds & RequestQueryParams) {
    this.loading = true;
    try {
      const permitsResponse = await task(
        this.service.get({ businessLineId, businessUnitId, activeOnly, excludeExpired }),
      );

      this.setItems(
        permitsResponse.map(permit => {
          return new Permit(this, permit);
        }),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Permit',
        message: `Permits Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
          businessLineId,
          activeOnly,
          excludeExpired,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IPermit) {
    try {
      const newPermit = await task(this.service.create(data));

      this.setItem(new Permit(this, newPermit));
      NotificationHelper.success('create', 'Permit');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Permit');
      Sentry.addBreadcrumb({
        category: 'Permit',
        message: `Permits Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const permit = new Permit(this, response);

      this.setItem(permit);
      this.selectEntity(permit);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Permit',
        message: `Permits Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(data: IPermit) {
    try {
      this.clearPreconditionFailedError();
      const updatedPermit = await task(this.service.update(data.id, data));

      this.setItem(new Permit(this, updatedPermit));
      NotificationHelper.success('update', 'Permit');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(data.id));
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Permit');
      }
      Sentry.addBreadcrumb({
        category: 'Permit',
        message: `Permits Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
  }
}
