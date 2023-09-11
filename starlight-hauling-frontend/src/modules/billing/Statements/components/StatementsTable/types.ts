import { Statement } from '../../store/Statement';

export interface IStatementsTable {
  tableRef: React.RefObject<HTMLTableElement>;
  onSelect(statement: Statement): void;
  onSort(): void;
}
