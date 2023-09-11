import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';
import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { NotificationHelper } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import GlobalStore from '../../../../stores/GlobalStore';
import { BatchStatementService } from '../api/batchStatement';
import { LastStatementBalance } from '../api/types';
import { BatchStatementSortType, INewBatchStatement } from '../types';

import { BatchStatement } from './BatchStatement';

export class BatchStatementStore extends BaseStore<BatchStatement, BatchStatementSortType> {
  @observable previousStatementsBalance: LastStatementBalance[] | undefined;

  private readonly service: BatchStatementService;

  constructor(global: GlobalStore) {
    super(global, 'STATEMENT_DATE', 'desc');
    this.service = new BatchStatementService();
  }

  @actionAsync
  async request({ businessUnitId }: { businessUnitId: string }) {
    this.loading = true;
    try {
      const response = await task(
        this.service.getBatchStatements({
          limit: this.limit,
          offset: this.offset,
          sortOrder: this.sortOrder,
          sortBy: this.sortBy,
          businessUnitId,
        }),
      );

      this.validateLoading(response.batchStatements, this.limit);

      const batchStatementItems = response.batchStatements.map(
        batchStatement => new BatchStatement(this, batchStatement),
      );

      this.setItems(batchStatementItems);
    } catch (error) {
      const typedError = error as ApiError;

      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BatchStatement',
        message: `Batch Statement Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
        },
      });
      Sentry.captureException(typedError);
    }
    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async create(data: INewBatchStatement & { businessUnitId: string }) {
    this.quickViewLoading = true;
    try {
      const response = await task(this.service.createBatchStatement(data));

      this.quickViewLoading = false;
      NotificationHelper.success('create', 'Batch Statement');

      return response.createBatchStatement;
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error(
        'create',
        typedError?.response?.code as ActionCode,
        'Batch Statement',
      );
      Sentry.addBreadcrumb({
        category: 'BatchStatement',
        message: `Create Batch Statement Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
    }

    this.quickViewLoading = false;
  }

  @actionAsync
  async requestDetailed(id: number) {
    if (this.quickViewLoading) {
      return;
    }

    this.quickViewLoading = true;
    try {
      const { batchStatement } = await task(
        this.service.getBatchStatement({
          id,
        }),
      );

      if (batchStatement) {
        const batchStatementEntity = new BatchStatement(this, batchStatement);

        this.setItem(batchStatementEntity);
        this.selectEntity(batchStatementEntity);
      }
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BatchStatement',
        message: `Request Detailed Batch Statement Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
    this.quickViewLoading = false;
  }

  @actionAsync
  async requestPreviousStatementsBalance(ids: number[]) {
    this.quickViewLoading = true;
    try {
      const { customersLastStatementBalance } = await task(
        this.service.requestPreviousStatementsBalance({
          ids,
        }),
      );

      this.previousStatementsBalance = customersLastStatementBalance;
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BatchStatement',
        message: `Last Statements Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ids,
        },
      });
      Sentry.captureException(typedError);
    }
    this.quickViewLoading = false;
  }

  @actionAsync async sendBatchStatements(ids: number[]) {
    try {
      await this.service.sendBatchStatements(ids);
      NotificationHelper.success('send', 'Batch Statement');
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error('send', typedError?.response?.code as ActionCode, 'Batch Statement');
      Sentry.addBreadcrumb({
        category: 'BatchStatement',
        message: `Batch Statements Sending Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ids,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @action checkAll(value: boolean) {
    this.values.forEach(batchStatement => (batchStatement.checked = value));
  }

  @computed get checkedBatchStatements() {
    return this.values.filter(batchStatement => batchStatement.checked);
  }

  @computed get isAllChecked() {
    const batchStatements = this.values;
    const loading = this.loading;

    return (
      this.checkedBatchStatements.length === batchStatements.length &&
      batchStatements.length > 0 &&
      !loading
    );
  }
}
