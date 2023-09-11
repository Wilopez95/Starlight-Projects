import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { IThreshold } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ThresholdService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { Threshold } from './Threshold';
import { CreateOptions, RequestOptions } from './types';

export class ThresholdStore extends ConfigurationDataBaseStore<Threshold> {
  private readonly service: ThresholdService;

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new ThresholdService();
  }

  @actionAsync
  async request({
    businessLineId,
    businessLineIds,
    activeOnly,
  }: RequestOptions & RequestQueryParams) {
    this.loading = true;
    try {
      const thresholdsResponse = await task(
        this.service.get({
          businessLineId,
          businessLineIds,
          activeOnly,
        }),
      );
      this.setItems(thresholdsResponse.map(threshold => new Threshold(this, threshold)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Threshold',
        data: {
          businessLineId,
          businessLineIds,
        },
        message: `Threshold Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(entity: IThreshold, { duplicate = false }: CreateOptions = {}) {
    this.loading = true;
    if (duplicate) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      delete entity.id;
    }
    try {
      const newEntity = await task(this.service.create(entity));

      this.setItem(new Threshold(this, newEntity));
      NotificationHelper.success('create', 'Threshold');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Threshold');
      Sentry.addBreadcrumb({
        category: 'Threshold',
        data: {
          ...entity,
        },
        message: `Threshold Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const threshold = new Threshold(this, response);

      this.setItem(threshold);
      this.selectEntity(threshold);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Threshold',
        data: {
          id,
        },
        message: `Threshold Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update({
    id,
    businessLineId,
    description,
    applySurcharges,
    updatedAt,
  }: IThreshold & RequestOptions) {
    this.loading = true;
    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(
        this.service.patch(id, { description, businessLineId, updatedAt, applySurcharges }),
      );

      this.setItem(new Threshold(this, newEntity));
      NotificationHelper.success('update', 'Threshold');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await this.requestById(id);
      }
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Threshold');
      Sentry.addBreadcrumb({
        category: 'Threshold',
        data: {
          id,
          businessLineId,
          description,
          applySurcharges,
          updatedAt,
        },
        message: `Threshold Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }
}
