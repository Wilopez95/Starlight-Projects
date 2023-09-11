import { NavigationConfigItem, RoutingNavigationItem } from '@starlightpro/shared-components';

import { ITableFilter } from '../TableFilter/types';

export type TableNavigationHeaderProps = {
  navigationRef?: React.MutableRefObject<HTMLDivElement | null> | null;
  filterable?: boolean;
  initialSearchValue?: string;
  placeholder?: string;
  numericOnly?: boolean;
  className?: string;
  children?: React.ReactElement<ITableFilter>;
  tableRef?: React.MutableRefObject<HTMLDivElement | null>;
  additionalFilterActive?: boolean;
  showFilterIcon?: boolean;
  fullSizeFilter?: boolean;
  onSearch?(newSearch: string): void;
  additionalFilterHandler?: () => void;
} & (
  | {
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
