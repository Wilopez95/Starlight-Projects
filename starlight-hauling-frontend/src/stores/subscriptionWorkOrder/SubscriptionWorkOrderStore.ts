import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { SubscriptionWorkOrderService } from '@root/api';
import { RequestQueryParams } from '@root/api/base';
import { SubscriptionWorkOrderRequestRouteParams } from '@root/api/subscriptionWorkOrder/types';
import { NotificationHelper } from '@root/helpers';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';
import { IConfigurableSubscriptionWorkOrder, SubscriptionWorkOrder } from './SubscriptionWorkOrder';

export class SubscriptionWorkOrderStore extends BaseStore<SubscriptionWorkOrder> {
  private readonly service: SubscriptionWorkOrderService = new SubscriptionWorkOrderService();
  @observable isWorkOrderEditViewOpen = false;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(global: GlobalStore) {
    super(global);
  }

  @computed
  get quickViewCondition() {
    return this.isOpenQuickView;
  }

  @action
  openWorkOrderEdit() {
    this.isWorkOrderEditViewOpen = true;
  }

  @action
  closeWorkOrderEdit() {
    this.isWorkOrderEditViewOpen = false;
    this.toggleQuickView(false);
  }

  @actionAsync
  async request(
    routeRequestParams: SubscriptionWorkOrderRequestRouteParams,
    options: RequestQueryParams = {},
  ) {
    try {
      this.cleanup();
      const response = await task(this.service.get(routeRequestParams, options));

      this.setItems(
        response.map(
          subscriptionWorkOrder => new SubscriptionWorkOrder(this, subscriptionWorkOrder),
        ),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'SubscriptionWorkOrder',
        message: `Subscriptions Work Orders Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          routeRequestParams,
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  valuesBySubscriptionOrderId(subscriptionOrderId: number) {
    return this.values.filter(
      subscriptionWorkOrder => subscriptionWorkOrder.subscriptionOrderId === subscriptionOrderId,
    );
  }

  @action
  removeWorkOrdersBySubscriptionOrderId(subscriptionOrderId: number) {
    const workOrders = this.valuesBySubscriptionOrderId(subscriptionOrderId);

    workOrders.forEach(workOrder => this.removeEntity(workOrder.id));
  }

  @actionAsync
  async requestById(id: number, options: RequestQueryParams = {}) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id, options));
      const entity = new SubscriptionWorkOrder(this, response);

      this.setItem(entity);
      this.selectEntity(entity);

      return entity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'SubscriptionWorkOrder',
        message: `Subscriptions Work Orders Request by ID Error ${JSON.stringify(
          typedError?.message,
        )}`,
        data: {
          id,
          ...options,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(data: IConfigurableSubscriptionWorkOrder) {
    try {
      this.loading = true;
      await task(this.service.update(data));

      NotificationHelper.success('default');
      const updatedSubscriptionWorkOrder = await task(this.service.getById(data.id));
      const entity = new SubscriptionWorkOrder(this, updatedSubscriptionWorkOrder);

      this.setItem(entity);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    } finally {
      this.loading = false;
    }
  }
}
