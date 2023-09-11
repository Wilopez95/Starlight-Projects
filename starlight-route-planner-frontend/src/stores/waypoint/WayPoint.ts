import { WayPointType } from '@root/consts';
import { IAddress, IWayPoint, IWayPointLocation, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { WaypointStore } from './WayPointStore';

export class WayPointItem extends BaseEntity implements IWayPoint {
  type: WayPointType;
  description: string;
  address: IAddress;
  location: IWayPointLocation;
  store: WaypointStore;

  constructor(store: WaypointStore, entity: JsonConversions<IWayPoint>) {
    super(entity);

    this.store = store;
    this.type = entity.type;
    this.description = entity.description;
    this.address = entity.address;
    this.location = entity.location;
  }
}
