import React, { createContext, useContext, useMemo, useRef } from 'react';
import { Position } from 'geojson';

import { IMapHandle } from '@root/common';
import { IMapMergeData } from '@root/types';

interface IMapBoundsContext extends IMapHandle {
  mapRef: React.RefObject<IMapHandle>;
}

export const MapBoundsContext = createContext<IMapBoundsContext | undefined>(undefined);

export const useMapBounds = () => {
  const context = useContext(MapBoundsContext);

  return context as IMapBoundsContext;
};

export const MapBoundsProvider: React.FC = ({ children }) => {
  const mapRef = useRef<IMapHandle | null>(null);

  const context = useMemo(
    () => ({
      fitToMarkers: (arg?: Pick<IMapMergeData, 'coordinates'>[]) => {
        if (!mapRef.current) {
          return false;
        }

        return mapRef.current.fitToMarkers(arg);
      },
      getMapCenterByLngLatPosition: (coordinates?: Position) => {
        if (!mapRef.current) {
          return false;
        }

        return mapRef.current.getMapCenterByLngLatPosition(coordinates);
      },
      mapRef,
    }),
    [],
  );

  return <MapBoundsContext.Provider value={context}>{children}</MapBoundsContext.Provider>;
};
