import { createContext } from 'react';
import { Map, Marker } from 'mapbox-gl';

export interface IMapContext {
  map: Map | null;
  registerMarker(marker: Marker): void;
  unregisterMarker(marker: Marker): void;
}

export const MapContext = createContext<IMapContext>({
  map: null,
  registerMarker() {},
  unregisterMarker() {},
});
