export interface ITableBody {
  cells: number;
  children: React.ReactNode;
  loading?: boolean;
  rows?: number;
  className?: string;
  noResult?: boolean;
}
