import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { IBusinessContextIds, IPromo } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { PromoService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { Promo } from './Promo';

export class PromoStore extends ConfigurationDataBaseStore<Promo> {
  private readonly service: PromoService;

  constructor(global: GlobalStore) {
    super(global, ['code']);
    this.service = new PromoService();
  }

  @actionAsync
  async request({
    businessUnitId,
    businessLineId,
    activeOnly,
    excludeExpired,
  }: { excludeExpired?: boolean } & RequestQueryParams & IBusinessContextIds) {
    this.loading = true;
    try {
      const promoResponse = await task(
        this.service.get({
          activeOnly,
          excludeExpired,
          businessUnitId,
          businessLineId,
        }),
      );

      this.setItems(promoResponse.map(promo => new Promo(this, promo)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Promo',
        message: `Promos Request Error ${JSON.stringify(typedError?.message)}`,
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
  async create(entity: IPromo) {
    try {
      const newPromo = await task(this.service.create(entity));

      this.setItem(new Promo(this, newPromo));
      NotificationHelper.success('create', 'Promo');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Promo');
      Sentry.addBreadcrumb({
        category: 'Promo',
        message: `Promos Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...entity,
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
      const promo = new Promo(this, response);

      this.setItem(promo);
      this.selectEntity(promo);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Promo',
        message: `Promos Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(entity: IPromo) {
    try {
      this.clearPreconditionFailedError();
      const newPromo = await task(this.service.update(entity.id, entity));

      this.setItem(new Promo(this, newPromo));
      NotificationHelper.success('update', 'Promo');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(entity.id));
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Promo');
      }
      Sentry.addBreadcrumb({
        category: 'Promo',
        message: `Promos Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...entity,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async delete(id: number) {
    try {
      await task(this.service.delete(id));

      this.removeEntity(id);
      NotificationHelper.success('delete', 'Promo');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'Promo');
      Sentry.addBreadcrumb({
        category: 'Promo',
        message: `Promos Delete Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
  }
}
