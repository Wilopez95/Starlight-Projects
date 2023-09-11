import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import GlobalStore from '@root/app/GlobalStore';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { SortType } from '@root/core/types';
import { StatementService, StatementSorting } from '@root/finance/api/statement/statement';

import { Statement } from './Statement';

export class StatementStore extends BaseStore<Statement> {
  private readonly service: StatementService;

  @observable sortBy: StatementSorting = StatementSorting.CREATED_AT;
  @observable sortOrder: SortType = 'desc';

  constructor(global: GlobalStore) {
    super(global);
    this.service = new StatementService();
  }

  @computed get checkedStatements() {
    return this.values.filter((statement) => statement.checked);
  }

  @computed get isAllChecked() {
    const statements = this.values;
    const loading = this.loading;

    return !loading && statements.length > 0 && statements.every((statement) => statement.checked);
  }

  @action checkAll(value: boolean) {
    this.values.forEach((statement) => (statement.checked = value));
  }

  @actionAsync
  async requestByCustomer(customerId: number) {
    this.loading = true;

    try {
      const statementResponse = await task(
        this.service.getStatements({
          customerId,

          sortBy: this.sortBy,
          sortOrder: this.sortOrder.toUpperCase() as 'ASC' | 'DESC',
          limit: this.limit,
          offset: this.offset,
        }),
      );

      this.validateLoading(statementResponse.statements, this.limit);

      this.setItems(
        statementResponse.statements.map((statement: any) => new Statement(this, statement)),
      );
    } catch (error) {
      console.error('Statements Request Error', error);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @computed
  get noResult() {
    return !this.loading && this.values.length === 0;
  }

  @action.bound
  setSort(sortBy: StatementSorting, sortOrder: SortType) {
    this.cleanup();
    this.sortOrder = sortOrder;
    this.sortBy = sortBy;
  }
}
