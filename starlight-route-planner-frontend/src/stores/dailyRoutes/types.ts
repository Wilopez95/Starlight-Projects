import { IDropResult } from '@root/common/DragNDropList/types';
import { IDailyRoute } from '@root/types';

export interface IDailyRouteModalSettings {
  visible?: boolean;
  id?: number;
  activeTabIndex?: 0 | 1;
  pinData?: IDropResult;
}

export interface IDailyRouteModalSettingsParams extends IDailyRouteModalSettings {
  dailyRoute?: IDailyRoute;
}
