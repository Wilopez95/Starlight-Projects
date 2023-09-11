import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import * as Sentry from '@sentry/react';
import { action, computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import GlobalStore from '../../../../stores/GlobalStore';
import { FinanceChargeService } from '../api/financeCharge';
import { ISendFinanceChargeData } from '../api/types';
import { IFinanceChargeDraftData } from '../types';

import { FinanceCharge } from './FinanceCharge';
import { CustomerRequestParams, FinanceChargeSortType, RequestParams } from './types';

export class FinanceChargeStore extends BaseStore<FinanceCharge, FinanceChargeSortType> {
  private readonly service: FinanceChargeService;

  constructor(global: GlobalStore) {
    super(global, 'ID', 'desc');
    this.service = new FinanceChargeService();
  }

  @actionAsync async request({ businessUnitId, query, filters = {} }: RequestParams) {
    this.loading = true;

    try {
      const response = await task(
        this.service.getFinanceCharges({
          businessUnitId,
          limit: this.limit,
          offset: this.offset,
          filters,
          query,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        }),
      );

      this.validateLoading(response.financeCharges, this.limit);

      this.setItems(
        response.financeCharges.map(financeCharge => new FinanceCharge(this, financeCharge)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'FinanceCharge',
        data: {
          businessUnitId,
          query,
          filters,
        },
        message: `Finance Charges Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestByCustomer({ customerId, query, filters = {} }: CustomerRequestParams) {
    this.loading = true;

    try {
      const response = await task(
        this.service.getFinanceChargesByCustomer({
          customerId,
          filters,
          limit: this.limit,
          offset: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          query,
        }),
      );

      this.validateLoading(response.financeCharges, this.limit);

      this.setItems(
        response.financeCharges.map(financeCharge => new FinanceCharge(this, financeCharge)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'FinanceCharge',
        data: {
          customerId,
          query,
          filters,
        },
        message: `Finance Charges Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestDetailed(id: number) {
    this.quickViewLoading = true;
    try {
      const { financeCharge } = await task(this.service.getDetailedById({ id }));

      if (financeCharge) {
        const financeChargeEntity = new FinanceCharge(this, financeCharge);

        this.setItem(financeChargeEntity);
        this.updateSelectedEntity(financeChargeEntity);
        this.quickViewLoading = false;

        return financeChargeEntity;
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'FinanceCharge',
        data: {
          id,
        },
        message: `Finance Charges Request Detailed Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.quickViewLoading = false;
  }

  @actionAsync async sendFinanceCharges(data: ISendFinanceChargeData) {
    try {
      await this.service.sendFinanceCharges(data);

      NotificationHelper.success('send', 'Finance Charges');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('send', typedError?.response?.code as ActionCode, 'Finance Charges');
      Sentry.addBreadcrumb({
        category: 'FinanceCharge',
        data: {
          ...data,
        },
        message: `Send Finance Charges Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async create(data: IFinanceChargeDraftData[]): Promise<string | null> {
    if (this.quickViewLoading) {
      return null;
    }
    this.quickViewLoading = true;

    try {
      const { createFinanceCharge } = await task(this.service.createFinancialCharge(data));

      this.quickViewLoading = false;

      NotificationHelper.success('create', 'Finance Charges');

      return createFinanceCharge;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Finance Charges',
      );
      Sentry.addBreadcrumb({
        category: 'FinanceCharge',
        data: {
          ...data,
        },
        message: `Create Finance Charge Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.quickViewLoading = false;

    return null;
  }

  @action cleanup() {
    super.cleanup();
    this.quickViewLoading = false;
  }

  @action checkAll(value: boolean) {
    this.values.forEach(financeCharge => (financeCharge.checked = value));
  }

  @computed get checkedFinanceCharges() {
    return this.values.filter(financeCharge => financeCharge.checked);
  }

  @computed get isAllChecked() {
    const financeCharges = this.values;
    const loading = this.loading;

    return (
      this.checkedFinanceCharges.length === financeCharges.length &&
      financeCharges.length > 0 &&
      !loading
    );
  }
}
