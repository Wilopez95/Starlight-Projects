import { ComponentType } from 'react';
import {
  MUIDataTableProps,
  MUIDataTableColumnOptions,
  MUIDataTableColumn,
  MUIDataTableFilterOptions,
  MUIDataTableColumnState,
  MUIDataTableOptions,
  MUIDataTableState,
} from 'mui-datatables';
import { FilterInputProps } from '../Filter/Filter';
import { Moment } from 'moment';

export type RenderCustomComponent<P> = (props: P) => React.ReactNode;

export type ExtendedFilterTypes = FilterType | 'range' | 'daterange' | 'radio' | 'chip';

export interface FilterDataItem {
  value: string;
  label: JSX.Element | string;
}

interface DisplayCustomChipFunction<T = any> {
  value: T;
  index: number;
  chipClassName: string;
  onDelete: (event: any) => void;
}

export interface DataTableFilterOptions extends MUIDataTableFilterOptions {
  autoApply?: boolean;
  filterInput?: ComponentType<FilterInputProps>;
  displayCustomChip?: (props: DisplayCustomChipFunction) => JSX.Element;
}

export type FilterType = MUIDataTableColumnOptions['filterType'] | 'daterange' | 'range' | 'radio';

export interface DataTableColumnOptions extends Omit<MUIDataTableColumnOptions, 'filterType'> {
  filterType?: FilterType;
  filterOptions?: DataTableFilterOptions;
  filterData?: { label: JSX.Element | string; value: any }[];
  filterName?: string;
}

export interface DataTableColumn extends Omit<MUIDataTableColumn, 'options'> {
  options?: DataTableColumnOptions;
  highlightName?: string;
}

export interface DataTableColumnState extends Omit<MUIDataTableColumnState, 'filterType'> {
  filterType?: FilterType;
  filterOptions?: DataTableFilterOptions;
  filterData?: { label: JSX.Element | string; value: any }[];
  filterName?: string;
}

export type FilterListOption =
  | string
  | { label: string; value: unknown }
  | { from: Moment; to: Moment };

export type FilterList = FilterListOption[][];

export type DataTableColumnDef = string | DataTableColumn;
export interface DataTableState extends Omit<MUIDataTableState, 'columns' | 'filterList'> {
  columns: DataTableColumnState[];
  filterList: FilterList;
}

export interface DatatableProps extends Omit<MUIDataTableProps, 'columns' | 'options'> {
  loading?: boolean;
  options?: Omit<MUIDataTableOptions, 'onTableChange'> & {
    onTableChange?: (action: string, tableState: DataTableState) => void;
  };
  columns: DataTableColumnDef[];
}

export interface FilterField {
  columnIndex: number;
  value: any;
  field?: string;
}

export interface FilterFormValue {
  searchText: string;
  fields: FilterField[];
}

export interface DatatableFilterDisplayProps {
  name: string;
  column: DataTableColumnState;
}
