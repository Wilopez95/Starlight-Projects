import { Maybe } from '@root/core/types';
import { IStatement } from '@root/core/types/entities/statement';

export type CustomerStatementsResponse = {
  statements: IStatement[];
};

export type CustomerStatementResponse = {
  statement: Maybe<IStatement>;
};
