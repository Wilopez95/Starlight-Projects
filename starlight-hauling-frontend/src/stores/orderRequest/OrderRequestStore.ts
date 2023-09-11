import * as Sentry from '@sentry/react';
import { observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { OrderRequestService } from '@root/api';
import { NotificationHelper } from '@root/helpers';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { OrderRequest } from './OrderRequest';
import { IRequestByIdOptions, OrderRequestCount, OrderRequestStoreSortType } from './types';

export class OrderRequestStore extends BaseStore<OrderRequest, OrderRequestStoreSortType> {
  service = new OrderRequestService();

  @observable count?: OrderRequestCount;

  constructor(global: GlobalStore) {
    super(global, 'id', 'desc');
  }

  @actionAsync
  async requestCount(businessUnitId: string) {
    try {
      const count = await task(
        this.service.getCount({
          businessUnitId,
        }),
      );

      this.count = count;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'OrderRequest',
        data: {
          businessUnitId,
        },
        message: `Order Requests Count Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById({ id, ...params }: IRequestByIdOptions) {
    try {
      const orderRequestResponse = await task(this.service.getById(id, params));
      const order = new OrderRequest(this, orderRequestResponse);

      this.setItem(order);

      return order;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'OrderRequest',
        data: {
          id,
          ...params,
        },
        message: `Order Requests Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    return null;
  }

  @actionAsync
  async rejectById(id: number) {
    try {
      this.loading = true;
      await task(this.service.patch(id, null));
      this.loading = false;
      NotificationHelper.success('orderRequestReject');

      return true;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('orderRequestReject', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'OrderRequest',
        data: {
          id,
        },
        message: `Order Requests Reject By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;

    return false;
  }

  @actionAsync
  async getOrderRequests(businessUnitId: string) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const response = await task(
        this.service.getOrdersRequests({
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          businessUnitId,
        }),
      );

      this.validateLoading(response, this.limit);

      const orders = response.map(order => new OrderRequest(this, order));

      this.setItems(orders);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'OrderRequest',
        data: {
          businessUnitId,
        },
        message: `Order Requests Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }
}
