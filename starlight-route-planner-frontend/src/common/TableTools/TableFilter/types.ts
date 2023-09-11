import { ISelectOption } from '@starlightpro/shared-components';

import { ITableFilterConfig } from './TableFilterConfig/types';

export type FilterItemValue = string | number;

export type FilterState = {
  filterBy: string;
  filterValue: FilterItemValue[];
};

export type AppliedFilterState = Record<string, string[] | string>;

export interface ITableFilter {
  children: React.ReactElement<ITableFilterConfig>[] | React.ReactElement<ITableFilterConfig>;
  onApply(newFilterState: AppliedFilterState): void;
}

export interface ITableFilterContext {
  isFilterOpen: boolean;
  onChangeAppliedState(value: boolean): void;
}

export interface IFilterConfigContext {
  selectedOptions: ISelectOption[];
  onAdd(value: ISelectOption, customProps?: Record<string, string>): void;
  shouldRender(label: string, filterByKey?: string): boolean;
}
