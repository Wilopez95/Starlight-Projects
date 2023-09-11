import * as Sentry from '@sentry/react';
import { action, computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ActionCode } from '@root/helpers/notifications/types';

import { ApiError } from '@root/api/base/ApiError';
import { NotificationHelper, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import GlobalStore from '../../../../stores/GlobalStore';
import { StatementService } from '../api/statement';
import { INewStatement, StatementSortType } from '../types';

import { Statement } from './Statement';

export class StatementStore extends BaseStore<Statement, StatementSortType> {
  private readonly service: StatementService;

  constructor(global: GlobalStore) {
    super(global, 'STATEMENT_DATE', 'desc');
    this.service = new StatementService();
  }

  @action
  cleanupStatements() {
    this.loading = false;
    this.quickViewLoading = false;
    this.loaded = false;
    this.offset = 0;
    this.data.clear();
    this.isPreconditionFailed = false;
  }

  @computed get checkedStatements() {
    return this.values.filter(statement => statement.checked);
  }

  @computed get isAllChecked() {
    const statements = this.values;
    const loading = this.loading;

    return !loading && statements.length > 0 && statements.every(statement => statement.checked);
  }

  @action checkAll(value: boolean) {
    this.values.forEach(statement => (statement.checked = value));
  }

  @actionAsync
  async requestByCustomer(customerId: number) {
    this.loading = true;

    try {
      const statementResponse = await task(
        this.service.getStatements({
          customerId,

          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          limit: this.limit,
          offset: this.offset,
        }),
      );

      this.validateLoading(statementResponse.statements, this.limit);

      this.setItems(statementResponse.statements.map(statement => new Statement(this, statement)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Statement',
        data: {
          customerId,
        },
        message: `Statements Request By Customer Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestDetailed(id: number | string) {
    try {
      const statementResponse = await task(this.service.getStatementById(+id));

      if (statementResponse.statement) {
        const newStatement = new Statement(this, statementResponse.statement);

        this.setItem(newStatement);

        this.updateSelectedEntity(newStatement);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Statement',
        data: {
          id,
        },
        message: `Statements Request Detailed Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async create(customerId: number, data: INewStatement & { businessUnitId: string }) {
    try {
      const statementResponse = await task(this.service.createStatement(customerId, data));
      const { createStatement } = statementResponse;

      NotificationHelper.success('create', 'Statement');

      return createStatement;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.captureException(typedError);
      Sentry.addBreadcrumb({
        category: 'Statement',
        data: {
          customerId,
          ...data,
        },
        message: `Statements Create Error ${JSON.stringify(typedError?.message)}`,
      });

      if (typedError.response.code === ActionCode.NOT_FOUND) {
        NotificationHelper.error('createStatement', ActionCode.NOT_FOUND);

        return;
      }

      NotificationHelper.error('default', typedError?.response?.code as ActionCode, 'Statement');
    }

    return null;
  }

  @actionAsync
  async deleteStatement(statementId: number) {
    try {
      await task(this.service.deleteStatement(statementId));
      this.removeEntity(statementId);
      NotificationHelper.success('delete', 'Statement');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'Statement');
      Sentry.addBreadcrumb({
        category: 'Statement',
        data: {
          statementId,
        },
        message: `Statements Delete Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestStatementEndDate(customerId: number) {
    try {
      const dateResponse = await task(this.service.requestStatementEndDate(customerId));

      return substituteLocalTimeZoneInsteadUTC(dateResponse.newStatementEndDate);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Statement',
        data: {
          customerId,
        },
        message: `Statements Request End Date Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async sendStatements(statementsIds: number[], emails?: string[]) {
    try {
      await task(this.service.sendStatements(statementsIds, emails));
      NotificationHelper.success('send', 'Statements');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('send', typedError?.response?.code as ActionCode, 'Statements');
      Sentry.addBreadcrumb({
        category: 'Statement',
        data: {
          statementsIds,
          emails,
        },
        message: `Statements Send Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
