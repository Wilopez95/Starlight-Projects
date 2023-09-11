import React from 'react';

import { IWayPoint } from '@root/types';

import { WayPointMarker } from './WayPointMarker';

interface IWayPointsLayer {
  markers: IWayPoint[];
  onPopup?: (data: IWayPoint) => void;
}

export const WayPointsLayer: React.FC<IWayPointsLayer> = ({ markers, onPopup }) => (
  <>
    {markers.map(markerData => (
      <WayPointMarker key={markerData.id} data={markerData} onClick={onPopup} />
    ))}
  </>
);
