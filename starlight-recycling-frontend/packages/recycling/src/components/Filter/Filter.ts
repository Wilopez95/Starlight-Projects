import { DataTableColumnState, DataTableFilterOptions, FilterType } from '../Datatable/types';

export interface Filter {
  name: string;
  index: number;
  filterName?: string;
  filterType?: string;
  filterOptions?: DataTableFilterOptions;
  label?: JSX.Element | string;
}

export interface FilterDisplayOptions {
  name: string;
  filterData?: DataTableColumnState['filterData'];

  type?: FilterType;
}

export interface FilterInputProps extends FilterDisplayOptions {
  onApply?: () => void;
}

export interface FilterDisplayProps extends FilterDisplayOptions {
  onDelete?<T>(value: T, index: number): void;
}
