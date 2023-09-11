import * as Sentry from '@sentry/react';
import { format } from 'date-fns';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { dateFormatsEnUS } from '@root/i18n/format/date';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { NotificationHelper } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import GlobalStore from '../../../../stores/GlobalStore';
import { SettlementService } from '../api/settlement';

import { Settlement } from './Settlement';
import { SettlementCreateParams, SettlementRequestParams, SettlementSortType } from './types';

export class SettlementStore extends BaseStore<Settlement, SettlementSortType> {
  @observable count?: number;

  private readonly service: SettlementService;

  constructor(global: GlobalStore) {
    super(global, 'DATE', 'desc');
    this.service = new SettlementService();
  }

  @actionAsync
  async request({ from, to, businessUnitId }: SettlementRequestParams) {
    this.loading = true;
    try {
      const settlementResponse = await task(
        this.service.getAll({
          limit: this.limit,
          offset: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          from: from ? format(from, dateFormatsEnUS.ISO) : undefined,
          to: to ? format(to, dateFormatsEnUS.ISO) : undefined,
          businessUnitId,
        }),
      );

      this.count = settlementResponse.settlementsCount;

      this.validateLoading(settlementResponse.settlements, this.limit);

      this.setItems(
        settlementResponse.settlements.map(settlement => new Settlement(this, settlement)),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Settlement',
        data: {
          from,
          to,
          businessUnitId,
        },
        message: `Settlements Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestById(id: number) {
    try {
      const { settlement: responseSettlement } = await task(this.service.getById({ id }));

      if (responseSettlement) {
        const settlement = new Settlement(this, responseSettlement);

        this.setItem(settlement);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Settlement',
        data: {
          id,
        },
        message: `Settlements Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async createSettlement(params: SettlementCreateParams) {
    try {
      const { requestSettlement } = await task(this.service.requestSettlement(params));

      return requestSettlement;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Settlement');
      Sentry.addBreadcrumb({
        category: 'Settlement',
        data: {
          ...params,
        },
        message: `Settlements Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    return null;
  }

  @actionAsync
  async deleteSettlements(ids: number[]) {
    try {
      await task(this.service.deleteSettlements(ids));

      ids.forEach(id => this.removeEntity(id));

      this.count = this.count ? this.count - ids.length : 0;

      NotificationHelper.success('delete', 'Settlement');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'Settlement');
      Sentry.addBreadcrumb({
        category: 'Settlement',
        data: {
          ids,
        },
        message: `Settlements Delete Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @action checkAll(value: boolean) {
    this.values.forEach(invoices => (invoices.checked = value));
  }

  @computed get checkedSettlements() {
    return this.values.filter(settlement => settlement.checked);
  }

  @computed get isAllChecked() {
    const settlements = this.values;
    const loading = this.loading;

    return (
      this.checkedSettlements.length === settlements.length && settlements.length > 0 && !loading
    );
  }
}
