import { DailyRouteStatusEnum } from '@root/consts/dailyRouteStatus';
import { JsonConversions } from '@root/types';
import { IDailyRoute } from '@root/types/entities/dailyRoute';

import { BaseEntity } from '../base/BaseEntity';

import { DailyRouteStore } from './DailyRouteStore';

export class DailyRoute extends BaseEntity implements IDailyRoute {
  name: string;
  status: DailyRouteStatusEnum;
  serviceDate: string;
  editingBy?: string;

  constructor(store: DailyRouteStore, entity: JsonConversions<IDailyRoute>) {
    super(entity);
    this.name = entity.name;
    this.status = entity.status;
    this.serviceDate = entity.serviceDate;
    this.editingBy = entity.editingBy;
  }
}
