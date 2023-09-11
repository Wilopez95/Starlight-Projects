import * as Sentry from '@sentry/react';
import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { RecurrentOrderService } from '@root/api';
import { OrderErrorCodes } from '@root/consts/orderErrorCodes';
import { NotificationHelper } from '@root/helpers';
import { INewRecurrentOrder } from '@root/pages/NewRequest/NewRequestForm/forms/RecurrentOrder/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { IRecurrentOrder } from '@root/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { RecurrentOrder } from './RecurrentOrder';
import { mapNewRecurrentOrderRequest } from './sanitize';
import { RecurrentOrderStoreSortType, RequestOptions } from './types';

export class RecurrentOrderStore extends BaseStore<RecurrentOrder, RecurrentOrderStoreSortType> {
  service = new RecurrentOrderService();

  @observable paymentError = false;
  @observable count?: number;

  constructor(global: GlobalStore) {
    super(global, 'startDate');
  }

  @actionAsync
  async create(data: INewRecurrentOrder) {
    const payload = mapNewRecurrentOrderRequest(data);

    try {
      this.loading = true;
      const response = await task(this.service.create(payload as Partial<IRecurrentOrder>));

      NotificationHelper.success('createOrder', response.id);

      return response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.paymentError = typedError?.response?.code === OrderErrorCodes.PaymentRequired;
      if (
        typedError.response?.details?.[0]?.message ===
        '"payment.deferredUntil" must be greater than "now"'
      ) {
        NotificationHelper.custom(
          'error',
          'Deferred day should be at least 1 day later than today',
        );
      } else if (
        typedError.response?.message ===
        'Service date must be later deferredUntil date at least in 1 day'
      ) {
        NotificationHelper.custom(
          'error',
          'Service date should be at least 1 day later than deferred day',
        );
      } else if (!this.paymentError) {
        NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Order');
        Sentry.addBreadcrumb({
          category: 'RecurrentOrder',
          message: `Recurrent Orders Create Error ${JSON.stringify(typedError?.message)}`,
          data: {
            ...data,
          },
        });
        Sentry.captureException(typedError);
      }
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(id: number, recurrentOrder: INewRecurrentOrder) {
    try {
      this.clearPreconditionFailedError();
      this.loading = true;
      const response = await task(this.service.update(id, recurrentOrder));

      NotificationHelper.success('editOrder', id);

      return response;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      NotificationHelper.error('editOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'RecurrentOrder',
        message: `Recurrent Orders Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
          ...recurrentOrder,
        },
      });
      Sentry.captureException(typedError);

      if (this.isPreconditionFailed) {
        this.requestById(id);
      }
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async putOnHold(id: number) {
    try {
      this.loading = true;
      await task(this.service.putOnHold(id));

      await this.requestById(id);
      NotificationHelper.success('putOnHoldOrder', id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('putOnHoldOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'RecurrentOrder',
        message: `Recurrent Orders Put On Hold Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async putOffHold(id: number) {
    try {
      this.loading = true;
      await task(this.service.putOffHold(id));

      await this.requestById(id);
      NotificationHelper.success('putUnHoldOrder', id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('putUnHoldOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'RecurrentOrder',
        message: `Recurrent Orders Put Off Hold Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async close(id: number) {
    try {
      this.loading = true;
      await task(this.service.close(id));

      await this.requestById(id);
      NotificationHelper.success('closeRecurrentOrder', id);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('closeRecurrentOrder', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'RecurrentOrder',
        message: `Recurrent Orders Close Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async requestByCustomer(customerId: number, { query }: RequestOptions = {}) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const response = await task(
        this.service.get({
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          customerId,
          query,
        }),
      );

      this.validateLoading(response, this.limit);

      const orders = response.map(order => new RecurrentOrder(this, order));

      this.setItems(orders);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'RecurrentOrder',
        message: `Recurrent Orders Request By Customer Error ${JSON.stringify(
          typedError?.message,
        )}`,
        data: {
          customerId,
          query,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestCount(customerId: number, { query }: RequestOptions = {}) {
    try {
      const countResponse = await task(
        this.service.getCount({
          customerId,
          query,
        }),
      );
      this.count = countResponse.total;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'RecurrentOrder',
        message: `Recurrent Orders Request Count Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
          query,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getViewDetails(id));

      const entity = new RecurrentOrder(this, response);

      this.setItem(entity);
      this.updateSelectedEntity(entity);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'RecurrentOrder',
        message: `Recurrent Orders Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.loading = false;
    }
    this.loading = false;
  }

  @action
  cleanPaymentError() {
    this.paymentError = false;
  }
}
