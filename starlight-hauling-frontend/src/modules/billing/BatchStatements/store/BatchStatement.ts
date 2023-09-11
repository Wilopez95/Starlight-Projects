import { action, observable } from 'mobx';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { JsonConversions } from '../../../../types';
import { IBatchStatement, IStatement } from '../../types';

import { BatchStatementStore } from './BatchStatementStore';

export class BatchStatement extends BaseEntity implements IBatchStatement {
  statementDate: Date;
  endDate: Date;
  count: number;
  total: number;
  statements?: IStatement[];

  @observable checked = false;
  store: BatchStatementStore;

  constructor(store: BatchStatementStore, entity: JsonConversions<IBatchStatement>) {
    super(entity);

    this.statementDate = substituteLocalTimeZoneInsteadUTC(entity.statementDate);
    this.endDate = substituteLocalTimeZoneInsteadUTC(entity.endDate);
    this.count = Number(entity.count);
    this.total = Number(entity.total);
    this.statements = entity.statements?.map(statement => convertDates(statement));

    this.store = store;
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
