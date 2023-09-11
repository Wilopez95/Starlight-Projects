import { IStatement } from '../../../../Statements/types';

export interface IStatementRow {
  statement: IStatement;
  selected?: boolean;
  onSelect(): void;
}
