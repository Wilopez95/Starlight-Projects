import { action, observable } from 'mobx';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { ICustomer, JsonConversions } from '../../../../types';
import { type IStatement, type IStatementEmail } from '../types';

import { type StatementStore } from './StatementStore';

export class Statement extends BaseEntity implements IStatement {
  statementDate: Date;
  endDate: Date;
  invoicesCount: number;
  invoicesTotal: number;
  balance: number;

  emails: IStatementEmail[];
  prevBalance?: number;
  customer?: ICustomer;
  pdfUrl: string;
  prevPdfUrl?: string;
  financeChargeExists?: boolean;

  store: StatementStore;

  @observable checked = false;

  constructor(store: StatementStore, entity: JsonConversions<IStatement>) {
    super(entity);

    this.store = store;

    this.invoicesCount = entity.invoicesCount;
    this.invoicesTotal = entity.invoicesTotal;
    this.balance = entity.balance;
    this.pdfUrl = entity.pdfUrl;
    this.prevPdfUrl = entity.prevPdfUrl;

    this.emails = entity.emails?.map(convertDates) ?? [];

    this.statementDate = substituteLocalTimeZoneInsteadUTC(entity.statementDate);
    this.endDate = substituteLocalTimeZoneInsteadUTC(entity.endDate);

    this.financeChargeExists = entity.financeChargeExists;
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
