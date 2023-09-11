import { DailyRouteStatusEnum } from '@root/consts/dailyRouteStatus';

import { IEntity } from './entity';

export interface IDailyRoute extends IEntity {
  status: DailyRouteStatusEnum;
  name: string; // name is unique
  serviceDate: string;
  editingBy?: string;
}
