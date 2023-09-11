import { createContext } from 'react';
import { Map } from 'mapbox-gl';

export interface IMapBoundariesContext {
  map: Map | null;
}

export const MapBoundariesContext = createContext<IMapBoundariesContext>({
  map: null,
});
