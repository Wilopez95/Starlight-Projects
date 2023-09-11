import React, {
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
} from 'react';
import { Layouts } from '@starlightpro/shared-components';
import bbox from '@turf/bbox';
import { type BBox, type Point } from 'geojson';
import mapboxgl, { LngLatBoundsLike } from 'mapbox-gl';

import { accessToken } from '@root/config/mapbox';
import { US_BBOX, US_CENTROID } from '@root/consts/address';

import { MapContext } from './MapContext';
import Marker from './Marker';
import { IInteractiveMap, IInteractiveMapHandle, IMarker, MapChild, MapStyleType } from './types';

mapboxgl.accessToken = accessToken;

const defaultMapStyle = 'mapbox://styles/mapbox/streets-v11';
const darkMapStyle = 'mapbox://styles/mapbox/light-v10';
const defaultZoom = 3.75;

const getMapStyleUrl = (mapStyle: MapStyleType) => {
  switch (mapStyle) {
    case 'dark':
      return darkMapStyle;

    default:
      return defaultMapStyle;
  }
};

const isMarker = (child: React.ReactNode): child is ReactElement<IMarker, typeof Marker> =>
  (child as MapChild)?.type === Marker;

const getMarkersBoundingBox = (mapChildren: React.ReactNode): BBox | null => {
  const markers: Point[] = [];

  React.Children.forEach(mapChildren, child => {
    if (isMarker(child)) {
      markers.push(child.props.initialPosition);
    }
  });

  if (markers.length === 0) {
    return null;
  }

  const geometry = { type: 'GeometryCollection', geometries: markers };

  return bbox(geometry);
};

const DEFAULT_FITTING_PADDING = 40;

const InteractiveMap: React.ForwardRefRenderFunction<IInteractiveMapHandle, IInteractiveMap> = (
  props,
  ref,
) => {
  const { zoom, children, initialFit, mapStyle = 'default' } = props;
  const [forced, forceUpdate] = useReducer((s: number) => s + 1, 0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const style = getMapStyleUrl(mapStyle);

    if (mapRef.current) {
      mapRef.current.setStyle(style);
    }

    // TODO: add timeout
    if (mapRef.current || !mapContainerRef.current) {
      return;
    }

    const map = new mapboxgl.Map({
      zoom: defaultZoom,
      center: US_CENTROID.coordinates as [number, number],
      container: mapContainerRef.current,
      style,
      maxBounds: US_BBOX,
    });

    map.on('load', () => {
      mapRef.current = map;
      forceUpdate();
    });

    map.addControl(new mapboxgl.NavigationControl());
  }, [mapStyle]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (zoom) {
      mapRef.current.setZoom(zoom);
    }
  }, [forced, zoom]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (initialFit) {
      mapRef.current.fitBounds(initialFit as LngLatBoundsLike, {
        padding: DEFAULT_FITTING_PADDING,
      });
    }
  }, [forced, initialFit]);

  useImperativeHandle(ref, () => ({
    fitToMarkers: () => {
      if (!children || !mapRef.current) {
        return false;
      }

      // TODO: This is actually not very safe. Replace with runtime invariant.
      const boundingBox = getMarkersBoundingBox(children);

      if (!boundingBox) {
        return false;
      }

      mapRef.current.fitBounds(boundingBox as [number, number, number, number], {
        padding: DEFAULT_FITTING_PADDING,
      });

      return true;
    },
  }));

  return (
    <MapContext.Provider value={mapRef.current}>
      <Layouts.Box
        top={props.top ?? '0'}
        bottom={props.bottom ?? '0'}
        height={props.height}
        width={props.width ?? '100%'}
        position={props.position ?? 'absolute'}
        ref={mapContainerRef}
      />
      {children}
    </MapContext.Provider>
  );
};

export default forwardRef(InteractiveMap);
