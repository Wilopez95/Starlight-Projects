import React from 'react';

import { IMapMergeData } from '@root/types';

import { isEmpty } from 'lodash-es';
import { PinDiskProps } from '../Pin/PinDisk/helper';

import { CustomMarker } from './CustomMarker';
import { IRouteOptions } from './types';

interface ILayer {
  markers: IMapMergeData[];
  filterMap: [number, IRouteOptions][];
  selectedJobSiteId?: number;
  visible?: boolean;
  draggable?: boolean;
  onPopup?: (data: IMapMergeData) => void;
  showUnassignedJobSiteOnly?: boolean;
}
// Info: rootMarkerId must be always (to reuse this component in another places)
export const Layer: React.FC<ILayer> = ({
  markers,
  filterMap,
  onPopup,
  visible,
  draggable,
  selectedJobSiteId,
  showUnassignedJobSiteOnly,
}) => {
  const pinDiskProps = new PinDiskProps();

  let showAll: boolean = true;
  if (isEmpty(filterMap) && !showUnassignedJobSiteOnly) {
    showAll = true;
  } else {
    showAll = false;
  }

  return (
    <>
      {markers.map((markerData, index) => {
        const [, routeOptions = {}] =
          filterMap.find(([id]) => id === markerData.rootMarkerId) ?? [];

        return (
          <CustomMarker
            key={index}
            data={markerData}
            draggable={draggable}
            onClick={onPopup}
            isHighlighted={selectedJobSiteId === markerData.jobSiteId}
            pinDiskProps={pinDiskProps}
            {...routeOptions}
            visible={(visible && showAll) || routeOptions.visible}
          />
        );
      })}
    </>
  );
};
