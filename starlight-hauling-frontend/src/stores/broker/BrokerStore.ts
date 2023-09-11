import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { IBroker } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BrokerService } from '../../api';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import type GlobalStore from '../GlobalStore';

import { Broker } from './Broker';

export class BrokerStore extends ConfigurationDataBaseStore<Broker> {
  private readonly service: BrokerService;

  constructor(global: GlobalStore) {
    super(global, ['name']);
    this.service = new BrokerService();
  }

  @actionAsync
  async request(options: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const brokersResponse = await task(this.service.get(options));

      this.setItems(brokersResponse.map(broker => new Broker(this, broker)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Broker',
        data: {
          ...options,
        },
        message: `Brokers Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IBroker) {
    try {
      const newBroker = await task(this.service.create(data));

      this.setItem(new Broker(this, newBroker));
      NotificationHelper.success('create', 'Broker');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Broker');
      Sentry.addBreadcrumb({
        category: 'Broker',
        message: `Brokers Create Error ${JSON.stringify(typedError?.message)}`,
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
      const broker = new Broker(this, response);

      this.setItem(broker);
      this.selectEntity(broker);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Broker',
        message: `Brokers Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(data: IBroker) {
    try {
      this.clearPreconditionFailedError();
      const newBroker = await task(this.service.update(data.id, data));

      this.setItem(new Broker(this, newBroker));
      NotificationHelper.success('update', 'Broker');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(data.id));
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Broker');
      }
      Sentry.addBreadcrumb({
        category: 'Broker',
        message: `Brokers Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }
  }
}
