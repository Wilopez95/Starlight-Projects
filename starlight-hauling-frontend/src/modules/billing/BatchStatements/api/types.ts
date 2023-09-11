import { IBatchStatement } from '../types';

export type BatchStatementResponse = {
  batchStatements: IBatchStatement[];
};

export type BatchStatementDetailsResponse = {
  batchStatement: IBatchStatement;
};

export type PreviousStatementBalanceResponse = {
  customersLastStatementBalance: LastStatementBalance[];
};

export type LastStatementBalance = {
  id: number;
  statementBalance: number;
};
