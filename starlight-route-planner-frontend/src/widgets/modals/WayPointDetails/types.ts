import { IWayPoint } from '@root/types';

export interface IWaypointsDetails {
  data?: IWayPoint;
  onClosePopup: () => void;
}
