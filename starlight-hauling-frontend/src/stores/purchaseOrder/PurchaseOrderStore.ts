import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '@root/helpers';
import { IPurchaseOrder } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { PurchaseOrderService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import type GlobalStore from '../GlobalStore';

import { PurchaseOrder } from './PurchaseOrder';
import { IPurchaseOrdersRequestParams } from './types';

export class PurchaseOrderStore extends BaseStore<PurchaseOrder> {
  private readonly service: PurchaseOrderService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new PurchaseOrderService();
  }

  @actionAsync
  async request({ customerId }: IPurchaseOrdersRequestParams) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const purchaseOrdersResponse = await task(
        this.service.get({
          limit: this.limit,
          skip: this.offset,
          isOneTime: false,
          customerId,
        }),
      );

      this.validateLoading(purchaseOrdersResponse, this.limit);

      this.setItems(
        purchaseOrdersResponse.map(purchaseOrder => new PurchaseOrder(this, purchaseOrder)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PurchaseOrder',
        message: `Purchase Order Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async create(data: IPurchaseOrder) {
    try {
      const newPurchaseOrder = await task(
        this.service.create({
          ...data,
          isOneTime: false,
        }),
      );

      this.setItem(new PurchaseOrder(this, newPurchaseOrder));
      NotificationHelper.success('create', 'Purchase order');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Purchase order',
      );
      Sentry.addBreadcrumb({
        category: 'PurchaseOrder',
        data: {
          ...data,
        },
        message: `Purchase Order Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async update(data: IPurchaseOrder) {
    try {
      const newPurchaseOrder = await task(this.service.update(data.id, data));

      this.setItem(new PurchaseOrder(this, newPurchaseOrder));
      NotificationHelper.success('update', 'Purchase order');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Purchase order',
      );
      Sentry.addBreadcrumb({
        category: 'PurchaseOrder',
        data: {
          ...data,
        },
        message: `Purchase Order Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async getOptions({ customerId }: IPurchaseOrdersRequestParams) {
    try {
      const purchaseOrdersResponse = await task(
        this.service.get({
          isOneTime: false,
          active: true,
          notExpired: true,
          customerId,
        }),
      );

      this.setItems(
        purchaseOrdersResponse.map(purchaseOrder => new PurchaseOrder(this, purchaseOrder)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'PurchaseOrder',
        message: `Purchase Order Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
