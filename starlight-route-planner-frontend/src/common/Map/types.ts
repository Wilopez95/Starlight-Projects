import { Position } from 'geojson';

import { IMapMergeData, IWayPoint } from '@root/types';

import { IPinDiskProps } from '../Pin';

export enum MarkerAssetType {
  assigned = 'assigned',
  partialAssigned = 'partial-assigned',
  unassigned = 'unassigned',
}

export interface IMap {
  mapStyle: {
    id: string;
    markers: IMapMergeData[];
    showPopup: boolean;
    visible: boolean;
    filterMap: [number, IRouteOptions][];
    draggable?: boolean;
    showUnassignedJobSiteOnly?: boolean;
  }[];
  children: React.ReactNode;
  id: string;
  isMapSettingsModalToggled: boolean;
  waypoints: IWayPoint[];
  waypointPopupInfo?: IWayPoint;
  popupInfo?: IMapMergeData;
  renderPopup(data: IMapMergeData, onClose: () => void): void;
  toggleMapSettingsModal(): void;
  setWaypointPopupInfo(data?: IWayPoint): void;
  renderWaypointPopup(onClosePopup: () => void, data?: IWayPoint): void;
  setPopupInfo?(data?: IMapMergeData): void;
}

export interface IMapHandle {
  fitToMarkers(arg?: Pick<IMapMergeData, 'coordinates'>[]): boolean;
  getMapCenterByLngLatPosition: (coordinates?: Position) => boolean;
}

export interface IRouteOptions {
  visible?: boolean;
  sequence?: number;
  optionColor?: string;
  serviceDaysColors?: string[];
}

export interface ICustomMarker extends IRouteOptions {
  data: IMapMergeData;
  isHighlighted: boolean;
  draggable?: boolean;
  pinDiskProps?: IPinDiskProps;
  onClick?: (data: IMapMergeData) => void;
}

export interface IWayPointMarkerProps {
  data: IWayPoint;
  onClick?: (data: IWayPoint) => void;
}
