import { IGeofence, IJobSite } from '@root/types';

export interface IJobSiteEditForm {
  basePath?: string;
}

export interface IJobSiteEditData extends IJobSite {
  showGeofencing?: boolean;
  geofence?: IGeofence | null;
}
