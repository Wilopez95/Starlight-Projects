import { RouteType } from '@root/consts';
import { IMasterRouteEditModeNotice } from '@root/types';

export interface IEditingRouteNotice {
  isOpen: boolean;
  routeType: RouteType;
  editingInfo?: IMasterRouteEditModeNotice;
  onClose(): void;
}
