import { NavigationConfigItem } from '@starlightpro/shared-components';

import { RoutingNavigationItem } from '@root/common/RoutingNavigation';

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
      tabs: NavigationConfigItem[];
      shouldDeselect?: boolean;
      selectedTab?: NavigationConfigItem;
      onChangeTab(newTab: NavigationConfigItem): void;
    }
  | {
      routes: RoutingNavigationItem[];
    }
);
