import { WayPointType } from '@root/consts';

import { IAddress } from './address';

export interface IWayPointLocation {
  coordinates: number[];
  type: string;
}

export interface IWayPoint {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  type: WayPointType;
  description: string;
  address: IAddress;
  location: IWayPointLocation;
}
