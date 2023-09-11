export interface ITableRow {
  selected?: boolean;
  className?: string;
  onClick?(e: React.MouseEvent<HTMLTableRowElement>): void;
}
