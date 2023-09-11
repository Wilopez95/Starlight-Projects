import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import mapboxgl from 'mapbox-gl';
import { Point } from 'geojson';

import MarkerIcon from './MarkerIcon';
import { makeStyles } from '@material-ui/core/styles';

import { MapContext } from './MapContext';

const useStyles = makeStyles(
  (theme) => ({
    marker: {
      color: theme.palette.primary.main,
      display: 'block',
      width: '37px',
      height: '44px',
      transform: 'translate(0, -22px)',
    },
    markerDraggable: {
      cursor: 'pointer',
    },
  }),
  { name: 'Marker' },
);

export interface MarkerProps {
  position: Point;
  draggable?: boolean;
  flyToOnMount?: boolean;
  className?: string;
  onPositionChange?(position: Point): void;
  onDragEnd?(position: Point): void;
}

export interface MarkerHandle {
  flyToThis(): void;
  reset(): boolean;
  getLngLat(): { lat: number; lng: number } | undefined;
  setLngLat: (lng: number, lat: number) => void;
}

type DragHandler = () => void;

const Marker: React.ForwardRefRenderFunction<MarkerHandle, MarkerProps> = (
  { position, onPositionChange, onDragEnd, className, draggable = false, flyToOnMount },
  ref,
) => {
  const classes = useStyles();
  const mapboxMarker = useRef<mapboxgl.Marker | null>(null);
  const latestOnDragEnd = useRef<typeof onDragEnd | null>(null);
  const dragHandler = useRef<DragHandler | null>(null);
  const markerIcon = useRef<HTMLElement | null>(null);
  const [shouldFlyThis, setShouldFlyThis] = useState(false);
  const { map, registerMarker, unregisterMarker } = useContext(MapContext);

  useEffect(() => {
    if (!map) {
      return;
    }

    const markerElement = document.createElement('div');
    const marker = new mapboxgl.Marker(markerElement).setLngLat([0, 0]).addTo(map);

    mapboxMarker.current = marker;
    markerIcon.current = markerElement;

    ReactDOM.render(<MarkerIcon className={classes.marker} />, markerIcon.current);
    registerMarker(marker);

    return () => {
      marker.remove();
      ReactDOM.unmountComponentAtNode(markerElement);
      unregisterMarker(marker);
    };
  }, [classes.marker, map, registerMarker, unregisterMarker]);

  useLayoutEffect(() => {
    if (className && markerIcon.current) {
      ReactDOM.render(
        <MarkerIcon className={cx(classes.marker, className, { markerDraggable: draggable })} />,
        markerIcon.current,
      );
    }
  }, [className, classes.marker, draggable]);

  useEffect(() => {
    if (!map || !mapboxMarker.current) {
      return;
    }

    const marker = mapboxMarker.current;

    marker.setDraggable(draggable);

    if (!onDragEnd && dragHandler.current) {
      marker.off('dragend', dragHandler.current);

      dragHandler.current = null;
      latestOnDragEnd.current = null;
    } else if (onDragEnd && onDragEnd !== latestOnDragEnd.current) {
      if (dragHandler.current) {
        marker.off('dragend', dragHandler.current);
      }

      dragHandler.current = () => {
        onDragEnd({ type: 'Point', coordinates: marker.getLngLat().toArray() });
      };
      latestOnDragEnd.current = onDragEnd;

      marker.on('dragend', dragHandler.current);
    }

    return () => {
      if (dragHandler.current) {
        marker.off('dragend', dragHandler.current);
      }
    };
  }, [map, onDragEnd, draggable]);

  useEffect(() => {
    if (!map || !mapboxMarker.current) {
      return;
    }

    const marker = mapboxMarker.current;
    const currentCoordinates = marker.getLngLat().toArray();

    if (
      position.coordinates &&
      position.coordinates.some((coordinate, index) => coordinate !== currentCoordinates[index])
    ) {
      marker.setLngLat(position.coordinates as [number, number]);

      if (onPositionChange) {
        onPositionChange(position);
      }
    }
  }, [map, position, onPositionChange]);

  useEffect(() => {
    if (!map || !shouldFlyThis || !mapboxMarker.current) {
      return;
    }

    const lngLat = mapboxMarker.current.getLngLat();

    setShouldFlyThis(false);

    if (lngLat.lng === 0 && lngLat.lat === 0) {
      return;
    }

    if (!map.loaded()) {
      map.once('load', () => {
        if (!mapboxMarker.current) {
          return;
        }

        map.fitBounds(mapboxMarker.current.getLngLat().toBounds(100));
      });

      return;
    }

    map.fitBounds(mapboxMarker.current.getLngLat().toBounds(100));
  }, [shouldFlyThis, map]);

  useEffect(() => {
    if (flyToOnMount) {
      setShouldFlyThis(true);
    }
  }, [flyToOnMount]);

  useImperativeHandle(
    ref,
    () => ({
      flyToThis: () => {
        setShouldFlyThis(true);
      },
      reset: () => {
        if (mapboxMarker.current) {
          mapboxMarker.current.setLngLat(position.coordinates as [number, number]);

          return true;
        }

        return false;
      },
      setLngLat: (lng: number, lat: number) => {
        mapboxMarker.current?.setLngLat({
          lng,
          lat,
        });
      },
      getLngLat: () => {
        return mapboxMarker.current?.getLngLat();
      },
    }),
    [position.coordinates],
  );

  return null;
};

export default forwardRef(Marker);
