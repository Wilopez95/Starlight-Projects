import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { SurchargeService } from '@root/api/surcharge/surcharge';
import { NotificationHelper } from '@root/helpers';
import { ISurcharge } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { Surcharge } from './Surcharge';
import { RequestOptions } from './types';

export class SurchargeStore extends ConfigurationDataBaseStore<Surcharge> {
  private readonly service: SurchargeService;

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new SurchargeService();
  }

  @actionAsync
  async request({ businessLineId, activeOnly }: RequestOptions) {
    this.loading = true;
    try {
      const surchargesResponse = await task(this.service.get({ businessLineId, activeOnly }));
      this.data.clear();
      this.setItems(surchargesResponse.map(surcharge => new Surcharge(this, surcharge)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Surcharge',
        data: {
          businessLineId,
          activeOnly,
        },
        message: `Surcharges Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(entity: ISurcharge) {
    const partialEntity: Omit<ISurcharge, 'id'> & { id?: number } = entity;

    try {
      const newEntity = await task(this.service.create(partialEntity));

      this.setItem(new Surcharge(this, newEntity));
      NotificationHelper.success('create', 'Surcharge');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Surcharge',
        data: {
          ...entity,
        },
        message: `Surcharges Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const surcharge = new Surcharge(this, response);

      this.setItem(surcharge);
      this.selectEntity(surcharge);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Surcharge',
        data: {
          id,
        },
        message: `Surcharges Request  By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(entity: ISurcharge) {
    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(this.service.update(entity.id, entity));

      this.setItem(new Surcharge(this, newEntity));
      NotificationHelper.success('update', 'Surcharge');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await this.requestById(entity.id);
      }
      Sentry.addBreadcrumb({
        category: 'Surcharge',
        data: {
          ...entity,
        },
        message: `Surcharges Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
