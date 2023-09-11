import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import GlobalStore from '../../../../stores/GlobalStore';
import { PayoutService } from '../api/payout';
import { NewPayout } from '../types';

import { Payout } from './Payout';
import { sanitizePayout } from './sanitize';
import { PayoutSortType, RequestOptions } from './types';

export class PayoutStore extends BaseStore<Payout, PayoutSortType> {
  private readonly service: PayoutService;

  constructor(global: GlobalStore) {
    super(global, 'DATE', 'desc');
    this.service = new PayoutService();
  }

  @actionAsync
  async requestByCustomer(customerId: number, { query, filters = {} }: RequestOptions = {}) {
    this.loading = true;

    try {
      const payoutResponse = await task(
        this.service.getPayouts({
          customerId,
          sortBy: this.sortBy === 'DEPOSIT' ? 'DATE' : this.sortBy,
          sortOrder: this.sortOrder,
          limit: this.limit,
          offset: this.offset,
          filters,
          query,
        }),
      );

      this.validateLoading(payoutResponse.payouts, this.limit);

      this.setItems(payoutResponse.payouts.map(payout => new Payout(this, payout)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payout',
        data: {
          customerId,
          query,
          filters,
        },
        message: `Payouts Request By Customer Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestByBU(businessUnitId: number, { query, filters = {} }: RequestOptions = {}) {
    this.loading = true;

    try {
      const payoutResponse = await task(
        this.service.getPayouts({
          businessUnitId,

          sortBy: this.sortBy === 'DEPOSIT' ? 'DATE' : this.sortBy,
          sortOrder: this.sortOrder,
          limit: this.limit,
          offset: this.offset,
          filters,
          query,
        }),
      );

      this.validateLoading(payoutResponse.payouts, this.limit);

      this.setItems(payoutResponse.payouts.map(payout => new Payout(this, payout)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payout',
        data: {
          businessUnitId,
          query,
          filters,
        },
        message: `Payouts Request By BU Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestDetailed(id: number) {
    this.quickViewLoading = true;
    try {
      const payoutResponse = await task(this.service.getDetailedById(id));

      if (payoutResponse.payout) {
        const newPayout = new Payout(this, payoutResponse.payout);

        this.setItem(newPayout);
        this.updateSelectedEntity(newPayout);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payout',
        data: {
          id,
        },
        message: `Payouts Request Detailed Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.quickViewLoading = false;
  }

  @actionAsync
  async create(customerId: number, data: NewPayout) {
    try {
      const payoutResponse = await task(
        this.service.createPayout(customerId, sanitizePayout(data)),
      );

      const newPayout = new Payout(this, payoutResponse);

      this.setItem(newPayout);
      NotificationHelper.success('create', 'Payout');

      await this.globalStore.customerStore.selectedEntity?.requestBalances();

      return newPayout;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Payout');
      Sentry.addBreadcrumb({
        category: 'Payout',
        data: {
          customerId,
          ...data,
        },
        message: `Payouts Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
