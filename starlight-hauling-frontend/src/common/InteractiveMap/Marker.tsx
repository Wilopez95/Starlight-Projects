import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';

import { MapContext } from './MapContext';
import { MarkerAndTextWrapper, MarkerText, StyledMarker, StyledMarkerWithText } from './styles';
import { type IMarker, type IMarkerHandle } from './types';

type EventHandler = () => void;

const Marker: React.ForwardRefRenderFunction<IMarkerHandle, IMarker> = (
  { initialPosition, text, draggable = false, selected, color, onDragEnd, onClick },
  ref,
) => {
  const mapboxMarker = useRef<mapboxgl.Marker | null>(null);
  const latestOnDragEnd = useRef<typeof onDragEnd | null>(null);
  const dragHandler = useRef<EventHandler | null>(null);
  const clickHandler = useRef<EventHandler | null>(null);
  const markerIcon = useRef<HTMLElement | null>(null);
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map) {
      return;
    }

    const markerElement = document.createElement('div');
    const marker = new mapboxgl.Marker(markerElement).setLngLat([0, 0]).addTo(map);

    mapboxMarker.current = marker;
    markerIcon.current = markerElement;

    return () => {
      marker.remove();
      ReactDOM.unmountComponentAtNode(markerElement);
    };
  }, [map]);

  useEffect(() => {
    if (!map || !mapboxMarker.current) {
      return;
    }

    if (text) {
      ReactDOM.render(
        <MarkerAndTextWrapper>
          <StyledMarkerWithText $clickable={!!onClick} $selected={selected} />
          <MarkerText>{text}</MarkerText>
        </MarkerAndTextWrapper>,
        markerIcon.current,
      );
    } else {
      ReactDOM.render(
        <StyledMarker $clickable={!!onClick} $selected={selected} $color={color} />,
        markerIcon.current,
      );
    }
  }, [map, text, selected, onClick, color]);

  // TODO: write a re-usable hook to bridge React and Mapbox event handlers

  useEffect(() => {
    if (!map || !mapboxMarker.current) {
      return;
    }

    const marker = mapboxMarker.current;

    if (!onClick && clickHandler.current) {
      marker.off('click', clickHandler.current);

      clickHandler.current = null;
    } else if (onClick && onClick !== clickHandler.current) {
      if (clickHandler.current) {
        marker.off('click', clickHandler.current);
      }

      clickHandler.current = onClick;

      marker.on('click', clickHandler.current);
    }
  }, [map, onClick]);

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
  }, [map, onDragEnd, draggable]);

  useEffect(() => {
    if (!map || !mapboxMarker.current) {
      return;
    }

    const marker = mapboxMarker.current;
    const currentCoordinates = marker.getLngLat().toArray();

    if (
      initialPosition.coordinates.some(
        (coordinate, index) => coordinate !== currentCoordinates[index],
      )
    ) {
      marker.setLngLat(initialPosition.coordinates as [number, number]);
    }
  }, [map, initialPosition]);

  useImperativeHandle(ref, () => ({
    flyToThis: () => {
      if (map && mapboxMarker.current) {
        map.fitBounds(mapboxMarker.current.getLngLat().toBounds(100));

        return true;
      }

      return false;
    },
    reset: () => {
      if (mapboxMarker.current) {
        mapboxMarker.current.setLngLat(initialPosition.coordinates as [number, number]);

        return true;
      }

      return false;
    },
  }));

  return null;
};

export default forwardRef(Marker);
