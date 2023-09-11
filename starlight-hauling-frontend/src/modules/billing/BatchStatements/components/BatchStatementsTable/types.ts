import { BatchStatement } from '../../store/BatchStatement';

export interface IBatchStatementsTable extends IBatchStatementsTableHeader {
  tableBodyContainer: React.RefObject<HTMLTableElement>;
  onSelect(batchStatement: BatchStatement): void;
}

export interface IBatchStatementsTableHeader {
  onSort(): void;
}
