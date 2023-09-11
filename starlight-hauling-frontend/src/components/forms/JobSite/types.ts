import { Point } from 'geojson';

import { IAddress, IGeofence } from '@root/types';

import { IForm } from '../types';

export interface IJobSiteForm<T> extends IForm<T> {
  withMap?: boolean;
  isEditing?: boolean;
  jobSite?: IJobSiteData;
  nonSearchable?: boolean;
}

export interface IJobSiteData {
  name?: string;
  address: IAddress;
  location: Point;
  alleyPlacement: boolean;
  cabOver: boolean;
  showGeofencing?: boolean;
  searchString?: string;
  geofence?: IGeofence | null;
}
