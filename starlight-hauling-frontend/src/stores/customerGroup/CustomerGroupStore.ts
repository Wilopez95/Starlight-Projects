import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { CustomerGroupService } from '@root/api';
import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { ICustomerGroup } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import type GlobalStore from '../GlobalStore';

import { CustomerGroup } from './CustomerGroup';

export class CustomerGroupStore extends ConfigurationDataBaseStore<CustomerGroup> {
  private readonly service: CustomerGroupService;

  constructor(global: GlobalStore) {
    super(global, ['description']);
    this.service = new CustomerGroupService();
  }

  @actionAsync
  async request(options: RequestQueryParams = {}) {
    this.loading = true;

    try {
      const customerGroups = await task(this.service.get(options));
      this.setItems(customerGroups.map(group => new CustomerGroup(this, group)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'CustomerGroup',
        data: {
          ...options,
        },
        message: `Customer Groups Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: ICustomerGroup) {
    try {
      const newCustomerGroup = await task(this.service.create(data));

      this.setItem(new CustomerGroup(this, newCustomerGroup));
      NotificationHelper.success('create', 'Customer Group');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Customer Group',
      );
      Sentry.addBreadcrumb({
        category: 'CustomerGroup',
        data: {
          ...data,
        },
        message: `Customer Groups Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const customerGroup = new CustomerGroup(this, response);

      this.setItem(customerGroup);
      this.selectEntity(customerGroup);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'CustomerGroup',
        data: {
          id,
        },
        message: `Customer Groups Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(data: ICustomerGroup) {
    try {
      this.clearPreconditionFailedError();
      const newCustomerGroup = await task(this.service.update(data.id, data));

      this.setItem(new CustomerGroup(this, newCustomerGroup));
      NotificationHelper.success('update', 'Customer Group');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await task(this.requestById(data.id));
      } else {
        NotificationHelper.error(
          'update',
          typedError?.response?.code as ActionCode,
          'Customer Group',
        );
      }
      Sentry.addBreadcrumb({
        category: 'CustomerGroup',
        data: {
          ...data,
        },
        message: `Customer Groups Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
