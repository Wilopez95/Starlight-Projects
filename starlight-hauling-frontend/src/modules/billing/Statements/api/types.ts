import { Maybe } from '../../../../types';
import { IStatement } from '../types';

export type CustomerStatementsResponse = {
  statements: IStatement[];
};

export type CustomerStatementResponse = {
  statement: Maybe<IStatement>;
};
