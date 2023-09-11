export interface ITableCell {
  width?: number | string;
  height?: number;
  right?: boolean;
  center?: boolean;
  titleClassName?: string;
  className?: string;
  tag?: 'td' | 'th';
  colSpan?: number;
  full?: boolean;
  minWidth?: number;
  maxWidth?: number;
  to?: string;
  fallback?: string;
  capitalize?: boolean;
  emptyTh?: boolean;
  onClick?(e: React.MouseEvent): void;
}
