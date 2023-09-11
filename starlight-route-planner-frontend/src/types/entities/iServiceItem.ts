import { Position } from 'geojson';

export interface IServiceItem {
  jobSiteId: number;
  rootMarkerId: number;
  coordinates: Position;
  id?: number;
}
