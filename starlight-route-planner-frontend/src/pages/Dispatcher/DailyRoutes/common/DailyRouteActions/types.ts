import { IDailyRoute } from '@root/types';

export interface IQuickViewSettings {
  visible: boolean;
  dailyRoute: IDailyRoute;
}
export interface IDailyRouteActions {
  triggerEdit: (args: IDailyRoute) => Promise<{ isValid: boolean }>;
}
