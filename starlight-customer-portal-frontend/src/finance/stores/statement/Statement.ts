import { action, observable } from 'mobx';

import { convertDates, parseDate } from '@root/core/helpers';
import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import { JsonConversions } from '@root/core/types';
import { IStatement, IStatementEmail } from '@root/core/types/entities/statement';

import type { StatementStore } from './StatementStore';

export class Statement extends BaseEntity implements IStatement {
  statementDate: Date;
  endDate: Date;
  invoicesCount: number;
  invoicesTotal: number;
  balance: number;
  exagoPath: string;
  emails: IStatementEmail[];

  store: StatementStore;

  @observable checked = false;

  constructor(store: StatementStore, entity: JsonConversions<IStatement>) {
    super(entity);

    this.store = store;

    this.invoicesCount = entity.invoicesCount;
    this.invoicesTotal = entity.invoicesTotal;
    this.balance = entity.balance;
    this.exagoPath = entity.exagoPath;

    this.emails = entity.emails?.map(convertDates) ?? [];

    this.statementDate = parseDate(entity.statementDate);
    this.endDate = parseDate(entity.endDate);
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
