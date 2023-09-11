import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { FeatureCollection } from 'geojson';
import { useTheme } from '@material-ui/core/styles';
import {
  MAPBOX_ADMINISTRATIVE_TILESET_URL,
  MAPBOX_ADMINISTRATIVE_TILESET_ID,
} from '../../constants';

import { MapContext } from './MapContext';
import { MapBoundariesContext, IMapBoundariesContext } from './MapBoundariesContext';
import { TaxDistrictType } from './types';

export interface BoundariesProps {
  type: TaxDistrictType;
  onZoneClick?(zone: FeatureCollection): void;
  selectedZone?: string;
  children?: JSX.Element[] | JSX.Element | undefined | null;
}

const sourceId = MAPBOX_ADMINISTRATIVE_TILESET_ID;

type MapEventHandler = (event: mapboxgl.MapLayerMouseEvent) => void;

const selectedOrHovered = [
  'any',
  ['boolean', ['feature-state', 'selected'], false],
  ['boolean', ['feature-state', 'hovered'], false],
];

const applyColorIfNotActive = (color?: string) =>
  ['case', selectedOrHovered, color, 'transparent'] as mapboxgl.Expression;

const Boundaries: React.FC<BoundariesProps> = ({ type, onZoneClick, children }) => {
  const theme = useTheme();
  const boundaryTheme = theme.map.boundary;
  const { map } = useContext(MapContext);
  const activeLayer = useRef<string | null>(null);
  const prevLayer = useRef<string | undefined>();
  const latestOnZoneClick = useRef<typeof onZoneClick | null>(null);
  const zoneClickHandler = useRef<MapEventHandler | null>(null);
  const hoverHandler = useRef<MapEventHandler | null>(null);
  const mouseLeaveHandler = useRef<MapEventHandler | null>(null);
  const hovered = useRef<string | null>(null);

  const boundariesContext = useMemo<IMapBoundariesContext>(() => {
    return {
      map,
    };
  }, [map]);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (map.getSource(sourceId) === undefined) {
      map.addSource(sourceId, {
        type: 'vector',
        url: MAPBOX_ADMINISTRATIVE_TILESET_URL,
      });
    }

    return () => {
      if (activeLayer.current) {
        map.removeLayer(activeLayer.current);
        map.removeLayer(`${activeLayer.current}-outline`);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (activeLayer.current !== null) {
      if (zoneClickHandler.current !== null) {
        map.off('click', activeLayer.current, zoneClickHandler.current);
      }

      if (hoverHandler.current !== null) {
        map.off('mousemove', activeLayer.current, hoverHandler.current);
      }

      if (mouseLeaveHandler.current !== null) {
        map.off('mouseleave', activeLayer.current, mouseLeaveHandler.current);
      }

      map.removeLayer(activeLayer.current);
      map.removeLayer(`${activeLayer.current}-outline`);

      prevLayer.current = activeLayer.current;
    }

    activeLayer.current = type;

    map.addLayer({
      id: type,
      source: sourceId,
      'source-layer': type,
      type: 'fill',
      paint: {
        'fill-color': applyColorIfNotActive(boundaryTheme.fillColor),
      },
    });

    map.addLayer({
      id: `${type}-outline`,
      source: sourceId,
      'source-layer': type,
      type: 'line',
      paint: {
        'line-color': applyColorIfNotActive(boundaryTheme.outlineColor),
        'line-width': boundaryTheme.outlineWidth,
      },
    });

    hoverHandler.current = (event) => {
      if (event.features && event.features.length > 0) {
        if (hovered.current !== null) {
          const feature = { source: sourceId, sourceLayer: type, id: hovered.current };

          map.setFeatureState(feature, {
            ...map.getFeatureState(feature),
            hovered: false,
          });
        }

        hovered.current = event.features[0].id as string;

        map.setFeatureState(
          {
            source: sourceId,
            sourceLayer: type,
            id: hovered.current,
          },
          {
            ...event.features[0].state,
            hovered: true,
          },
        );
      }
    };

    mouseLeaveHandler.current = (event) => {
      if (hovered.current) {
        const oldState =
          event.features && event.features.length > 0 ? event.features[0].state : null;

        map.setFeatureState(
          {
            source: sourceId,
            sourceLayer: type,
            id: hovered.current,
          },
          {
            ...oldState,
            hovered: false,
          },
        );

        hovered.current = null;
      }
    };

    map.on('mousemove', activeLayer.current, hoverHandler.current);
    map.on('mouseleave', activeLayer.current, mouseLeaveHandler.current);

    return () => {
      if (!activeLayer.current) {
        return;
      }

      if (hoverHandler.current) {
        map.off('mousemove', activeLayer.current, hoverHandler.current);
      }

      if (mouseLeaveHandler.current) {
        map.off('mouseleave', activeLayer.current, mouseLeaveHandler.current);
      }
    };
  }, [boundaryTheme.fillColor, boundaryTheme.outlineColor, boundaryTheme.outlineWidth, map, type]);

  useEffect(() => {
    if (!map || !activeLayer.current) {
      return;
    }

    if (!onZoneClick && latestOnZoneClick.current) {
      map.off('click', type, zoneClickHandler.current as MapEventHandler);
      latestOnZoneClick.current = null;
      zoneClickHandler.current = null;

      return;
    }

    if (!onZoneClick) {
      return;
    }

    if (onZoneClick && latestOnZoneClick.current !== onZoneClick && zoneClickHandler.current) {
      map.off('click', type, zoneClickHandler.current);
    }

    latestOnZoneClick.current = onZoneClick;
    zoneClickHandler.current = (event) => {
      if (event.features === undefined || event.features.length < 1) {
        return;
      }

      onZoneClick({
        type: 'FeatureCollection',
        features: event.features,
      });
    };

    map.on('click', type, zoneClickHandler.current);

    return () => {
      if (zoneClickHandler.current) {
        map.off('click', type, zoneClickHandler.current);
      }
    };
  }, [map, onZoneClick, type]);

  return (
    <MapBoundariesContext.Provider value={boundariesContext}>
      {children}
    </MapBoundariesContext.Provider>
  );
};

export default Boundaries;
