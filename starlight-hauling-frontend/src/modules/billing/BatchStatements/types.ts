import { type IEntity } from '../../../types';
import { IStatement } from '../Statements/types';

export interface IBatchStatement extends IEntity {
  statementDate: Date;
  endDate: Date;
  count: number;
  total: number;
  statements?: IStatement[];
}

export interface INewBatchStatement {
  endDate: Date;
  statementIds?: number[];
  customerIds?: number[];
  statementDate?: Date;
}

export interface IBatchStatementCreateResult {
  createBatchStatement: IBatchStatement;
}

export type BatchStatementSortType = 'ID' | 'STATEMENT_DATE' | 'END_DATE' | 'COUNT' | 'TOTAL';
