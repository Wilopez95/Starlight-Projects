export type FilterValue = string | number | string[] | number[] | Date | boolean | unknown;
export type LabeledFilterValue = {
  label: string;
  value: FilterValue | Record<string, FilterValue>;
};

export type FilterItem = LabeledFilterValue | LabeledFilterValue[] | null;

export type FilterState = Record<string, FilterItem>;

export type AppliedFilterState = Record<string, FilterValue | Record<string, FilterValue>>;

export interface ITableFilter {
  children: React.ReactNode;
  onApply(newFilterState: AppliedFilterState): void;
}

export interface ITableFilterContext {
  isFilterOpen: boolean;
  onChangeAppliedState(value: boolean): void;
}

export interface IFilterStateContext {
  values: FilterState;
}

export interface IFilterConfigContext {
  filterByKey: string;
  filterState: FilterState;
  setFilterValue(key: string, value: FilterItem): void;
  removeFilterValue(key: string, index: number): void;
}

export interface IBaseFilter {
  maxSelectedItems?: number;
}

export type SubscriptionOrderFilters = AppliedFilterState & {
  filterByStatus?: string[];
  filterByBusinessLine?: number[];
  filterByServiceDateFrom?: string;
  filterByServiceDateTo?: string;
};
