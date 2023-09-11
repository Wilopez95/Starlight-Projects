import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { ITableFilter } from '@root/common/TableTools/TableFilter/types';
import { RequestOptions } from '@root/stores/subscriptionOrder/types';

export interface ITableHeader {
  requestOptions: RequestOptions;
  isSelectable: boolean;
  isCompletedTab: boolean;
}

export interface INavigation {
  children: React.ReactElement<ITableFilter>;
  onSearch(search: string): void;
}

export interface IFilters {
  isCompletedTab: boolean;
  onApply(filterState: AppliedFilterState): void;
}
