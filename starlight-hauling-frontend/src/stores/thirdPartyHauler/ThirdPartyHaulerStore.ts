import * as Sentry from '@sentry/react';
import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { convertDates, NotificationHelper } from '@root/helpers';
import { IThirdPartyHauler } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ThirdPartyHaulerService } from '../../api';
import {
  IThirdPartyHaulerCostsPayload,
  IThirdPartyHaulerCostsResponse,
} from '../../api/thirdPartyHauler/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { ThirdPartyHauler } from './ThirdPartyHauler';

export class ThirdPartyHaulerStore extends ConfigurationDataBaseStore<ThirdPartyHauler> {
  private readonly service: ThirdPartyHaulerService;

  @observable thirdPartyHaulerCosts: IThirdPartyHaulerCostsResponse[] = [];

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new ThirdPartyHaulerService();
  }

  @actionAsync
  async request({ activeOnly }: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const thirdPartyHaulerResponse = await task(this.service.get({ activeOnly }));

      this.setItems(
        thirdPartyHaulerResponse.map(
          thirdPartyHauler => new ThirdPartyHauler(this, thirdPartyHauler),
        ),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'ThirdPartyHauler',
        data: {
          activeOnly,
        },
        message: `Third Party Haulers Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(entity: IThirdPartyHauler) {
    this.loading = true;
    try {
      const newEntity = await task(this.service.create(entity));

      this.setItem(new ThirdPartyHauler(this, newEntity));
      NotificationHelper.success('create', 'Third Party Hauler');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Third Party Hauler',
      );
      Sentry.addBreadcrumb({
        category: 'ThirdPartyHauler',
        data: {
          ...entity,
        },
        message: `Third Party Haulers Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestById(id: number, historicalId?: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id, { historicalId }));

      if (historicalId) {
        response.id = response.originalId;
      }

      const thirdPartyHauler = new ThirdPartyHauler(this, response);

      this.setItem(thirdPartyHauler);
      this.selectEntity(thirdPartyHauler);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'ThirdPartyHauler',
        data: {
          id,
        },
        message: `Third Party Haulers Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(entity: IThirdPartyHauler) {
    this.loading = true;
    try {
      this.clearPreconditionFailedError();
      const newEntity = await task(this.service.update(entity.id, entity));

      this.setItem(new ThirdPartyHauler(this, newEntity));
      NotificationHelper.success('update', 'Third Party Hauler');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(entity.id));
      } else {
        NotificationHelper.error(
          'update',
          typedError?.response?.code as ActionCode,
          'Third Party Hauler',
        );
      }
      Sentry.addBreadcrumb({
        category: 'ThirdPartyHauler',
        data: {
          ...entity,
        },
        message: `Third Party Haulers Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async delete(id: number) {
    try {
      await task(this.service.delete(id));

      this.removeEntity(id);
      NotificationHelper.success('delete', 'Third Party Hauler');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'delete',
        typedError?.response?.code as ActionCode,
        'Third Party Hauler',
      );
      Sentry.addBreadcrumb({
        category: 'ThirdPartyHauler',
        data: {
          id,
        },
        message: `Third Party Haulers Delete Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestThirdPartyHaulerCosts(thirdPartyHaulerId: number, businessLineId: number) {
    this.loading = true;
    try {
      const thirdPartyHaulerCostsResponse = await task(
        this.service.requestThirdPartyHaulerCosts(thirdPartyHaulerId, businessLineId),
      );

      this.thirdPartyHaulerCosts = thirdPartyHaulerCostsResponse.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'ThirdPartyHaulerCosts',
        data: {
          thirdPartyHaulerId,
          businessLineId,
        },
        message: `Third Party Hauler Request Costs Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async updateThirdPartyHaulerCosts(id: number, data: IThirdPartyHaulerCostsPayload[]) {
    this.loading = true;
    try {
      await task(this.service.updateThirdPartyHaulerCosts(id, data));
      NotificationHelper.success('update', 'Third Party Hauler Costs');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'ThirdPartyHaulerCosts',
        data: {
          id,
          ...data,
        },
        message: `Third Party Hauler Update Costs Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }
}
