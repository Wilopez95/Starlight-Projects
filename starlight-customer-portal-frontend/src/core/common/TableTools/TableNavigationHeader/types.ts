import { NavigationConfigItem } from '@root/core/common/Navigation/types';
import { RoutingNavigationItem } from '@root/core/common/RoutingNavigation';

import { ITableFilter } from '../TableFilter/types';

export type TableNavigationHeaderProps = {
  navigationRef?: React.MutableRefObject<HTMLDivElement | null> | null;
  filterable?: boolean;
  initialSearchValue?: string;
  placeholder?: string;
  numericOnly?: boolean;
  className?: string;
  children?: React.ReactElement<ITableFilter>;
  showFilterIcon?: boolean;
  onSearch?(newSearch: string): void;
} & (
  | {
      tableRef: React.MutableRefObject<HTMLDivElement | null>;
      tabs: NavigationConfigItem[];
      shouldDeselect?: boolean;
      selectedTab?: NavigationConfigItem;
      onChangeTab(newTab: NavigationConfigItem): void;
    }
  | {
      routes: RoutingNavigationItem[];
    }
);

export interface ITableNavigationHeaderHandle {
  resetSearch(): void;
}
