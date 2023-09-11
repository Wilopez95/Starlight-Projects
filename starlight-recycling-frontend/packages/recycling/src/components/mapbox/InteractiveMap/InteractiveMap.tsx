import React, { memo, useRef, useEffect, useState, useMemo, RefObject } from 'react';
import { Point } from 'geojson';
import mapboxgl, { Marker } from 'mapbox-gl';
import { action, ColdSubscription } from 'popmotion';

import { MAPBOX_ACCESS_TOKEN, US_BBOX, US_CENTROID } from '../../../constants';

import { MapContext } from '../MapContext';
import { AddressOption } from '../featuresToAddressOptions';
import { useTheme, Theme } from '@material-ui/core';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface AddressMapFieldProps {
  className: string;
  wrapClassName?: string;
  value?: AddressOption;
  onChange?(option: AddressOption | null): void;
  onLongPress?(point: Point): void;
  onSinglePress?(point: Point): void;
  children?: (JSX.Element | undefined | null)[] | JSX.Element | undefined | null;
  wrapperRef?: RefObject<HTMLDivElement>;
}

interface InitMapOptions {
  mapContainer: React.RefObject<HTMLDivElement>;
  setMap: (map: mapboxgl.Map) => void;
  mapTheme: Theme['map'];
}

const initMap = ({ mapContainer, setMap, mapTheme }: InitMapOptions) => {
  const actionsSubs: ColdSubscription[] = [];

  const map = new mapboxgl.Map({
    center: US_CENTROID.coordinates,
    zoom: mapTheme.defaultZoom,
    container: mapContainer.current || '',
    style: mapTheme.mapStyle,
    maxBounds: US_BBOX,
  });

  (map as any).markers = [];

  map.on('load', () => {
    setMap(map);
  });

  map.addControl(new mapboxgl.NavigationControl());

  const onMousedown = action(({ update }) => {
    const onEvent = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => update(e);

    map.on('mousedown', onEvent);
    map.on('touchstart', onEvent);

    return {
      stop: () => {
        map.off('mousedown', onEvent);
        map.off('touchstart', onEvent);
      },
    };
  });
  const onMouseup = action(({ update }) => {
    const onEvent = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => update(e);

    map.on('mouseup', onEvent);
    map.on('touchend', onEvent);

    return {
      stop: () => {
        map.off('mouseup', onEvent);
        map.off('touchend', onEvent);
      },
    };
  });
  const onMouseMove = action(({ update }) => {
    const onEvent = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => update(e);

    map.on('mousemove', onEvent);
    map.on('dragstart', onEvent);

    return {
      stop: () => {
        map.off('mousemove', onEvent);
        map.off('dragstart', onEvent);
      },
    };
  });

  const onMarkerDragstart = (marker: Marker) =>
    action(({ update, complete }) => {
      const onEvent = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => update(e);

      if (!marker) {
        complete();

        return;
      }

      marker.on('dragstart', onEvent);

      return {
        stop: () => {
          map.off('dragstart', onEvent);
        },
      };
    });

  let mouseUpSubs: any;
  let mouseMoveSubs: any;
  let markerDragstartSubs: ColdSubscription[] = [];
  let showMarkerTimeout: any;
  let singleClickTimeout: any;

  // single click, like in google maps
  const trackSingleClickSubs = onMouseup.start(
    (event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      if (singleClickTimeout) {
        clearTimeout(singleClickTimeout);

        // in case of double click
        singleClickTimeout = null;

        return;
      }

      let mousedownSubs: any;
      let mousemoveSubs: any;

      const clearFn = () => {
        clearTimeout(singleClickTimeout);

        mousedownSubs.stop();
        mousemoveSubs.stop();
      };

      mousedownSubs = onMousedown.start(clearFn);
      mousemoveSubs = onMouseMove.start(clearFn);

      singleClickTimeout = setTimeout(() => {
        map.fire('singleclick', event);

        clearFn();

        // in case of double click
        singleClickTimeout = null;
      }, 400);
    },
  );
  actionsSubs.push(trackSingleClickSubs);

  // long press
  const subscription = onMousedown.start((event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    if (mouseUpSubs) {
      mouseUpSubs.stop();
    }

    showMarkerTimeout = setTimeout(() => {
      map.fire('longpress', event);
    }, 1000);

    const cleanUp = () => {
      clearTimeout(showMarkerTimeout);
      mouseUpSubs.stop();
      mouseMoveSubs.stop();
      markerDragstartSubs.forEach((sub) => sub.stop());
      markerDragstartSubs = [];
    };

    mouseUpSubs = onMouseup.start(cleanUp);
    mouseMoveSubs = onMouseMove.start(cleanUp);

    markerDragstartSubs = [];
    (map as any).markers.forEach((marker: any) => {
      markerDragstartSubs.push(onMarkerDragstart(marker).start(cleanUp));
    });
  });

  actionsSubs.push(subscription);

  return {
    cleanUp() {
      actionsSubs.forEach((subs) => subs.stop());
    },
  };
};

const emptyArray: Marker[] = [];

export const AddressMapFieldFC = memo<AddressMapFieldProps>(
  ({ className, wrapClassName, children, onLongPress, onSinglePress, wrapperRef }) => {
    const theme = useTheme();
    const mapTheme = theme.map;
    const mapContainer = useRef(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [markers, setMarkers] = useState<Marker[]>(emptyArray);

    const mapContext = useMemo(() => {
      return {
        map,
        unregisterMarker(marker: Marker) {
          marker.remove();
          setMarkers(markers.filter((m: any) => m !== marker));
        },
        registerMarker(marker: Marker) {
          markers.push(marker);
        },
      };
    }, [map, markers, setMarkers]);

    useEffect(() => {
      if (map) {
        return;
      }

      const { cleanUp } = initMap({
        mapContainer,
        mapTheme,
        setMap,
      });

      return cleanUp;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (!map) {
        return;
      }

      (map as any).markers = markers;
    }, [map, markers]);

    useEffect(() => {
      if (!map || !onLongPress) {
        return;
      }

      const fn = (event: any) => {
        onLongPress({
          type: 'Point',
          coordinates: [event.lngLat.lng, event.lngLat.lat],
        });
      };

      map.on('longpress', fn);

      return () => {
        map.off('longpress', fn);
      };
    }, [map, onLongPress]);

    useEffect(() => {
      if (!map || !onSinglePress) {
        return;
      }

      const fn = (event: any) => {
        onSinglePress({
          type: 'Point',
          coordinates: [event.lngLat.lng, event.lngLat.lat],
        });
      };

      map.on('singleclick', fn);

      return () => {
        map.off('singleclick', fn);
      };
    }, [map, onSinglePress]);

    return (
      <div className={wrapClassName} ref={wrapperRef}>
        <MapContext.Provider value={mapContext}>
          <div ref={mapContainer} className={className} />
          {children}
        </MapContext.Provider>
      </div>
    );
  },
);

export default AddressMapFieldFC;
