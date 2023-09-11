import { DailyRouteStatus } from '@root/consts';

export interface IMasterRouteStatusParams {
  published: boolean;
  editing: boolean;
  updating: boolean;
}

export interface IDailyRouteStatusParams {
  status: DailyRouteStatus;
  editingBy?: string | null;
}
