import { NavigationConfigItem } from '@starlightpro/shared-components';

export interface IUserQuickViewData {
  isNew: boolean;
  isLoading: boolean;
}

export interface IUserQuickViewRightPanelData {
  isNew: boolean;
  activeTab: NavigationConfigItem;
  setActiveTab: (item: NavigationConfigItem) => void;
  isLoading: boolean;
}
