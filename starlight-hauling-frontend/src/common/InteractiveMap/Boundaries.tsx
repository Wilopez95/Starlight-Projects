import React, { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from 'styled-components';

import { outlineWidth } from '@root/consts';

import { MapContext } from './MapContext';
import { type IBoundaries } from './types';

const tilesetPrefix = process.env.MAPBOX_STARLIGHT_TILESET_PREFIX as string;
const sourceId = 'administrative';

type MapEventHandler = (event: mapboxgl.MapLayerMouseEvent) => void;

const selectedOrHovered = [
  'any',
  ['boolean', ['feature-state', 'selected'], false],
  ['boolean', ['feature-state', 'hovered'], false],
];

const applyColorIfNotActive = (color: string) =>
  ['case', selectedOrHovered, color, 'transparent'] as mapboxgl.Expression;

const Boundaries: React.FC<IBoundaries> = ({ type, country, selectedZone, onZoneClick }) => {
  const map = useContext(MapContext);
  const activeLayer = useRef<string | null>(null);
  const prevLayer = useRef<string | undefined>();
  const latestOnZoneClick = useRef<typeof onZoneClick | null>(null);
  const zoneClickHandler = useRef<MapEventHandler | null>(null);
  const hoverHandler = useRef<MapEventHandler | null>(null);
  const mouseLeaveHandler = useRef<MapEventHandler | null>(null);
  const selected = useRef<string | null>(null);
  const hovered = useRef<string | null>(null);
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (map.getSource(sourceId) === undefined) {
      map.addSource(sourceId, {
        type: 'vector',
        url: `${tilesetPrefix}_${country.toLowerCase()}`,
      });
    }

    return () => {
      if (activeLayer.current) {
        map.removeLayer(activeLayer.current);
      }
    };
  }, [country, map]);

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
        'fill-color': applyColorIfNotActive(colors.primary.standard),
        'fill-opacity': 0.5,
      },
    });

    map.addLayer({
      id: `${type}-outline`,
      source: sourceId,
      'source-layer': type,
      type: 'line',
      paint: {
        'line-color': applyColorIfNotActive(colors.primary.standard),
        'line-width': outlineWidth,
      },
    });

    hoverHandler.current = event => {
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

    mouseLeaveHandler.current = event => {
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
  }, [colors.primary.standard, map, type]);

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
    zoneClickHandler.current = event => {
      if (event.features === undefined || event.features.length < 1) {
        return;
      }

      onZoneClick({
        type: 'FeatureCollection',
        features: event.features,
      });
    };

    map.on('click', type, zoneClickHandler.current);
  }, [map, onZoneClick, type]);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (selected.current && (!selectedZone || selectedZone !== selected.current)) {
      // TODO: think of a more elegant solution
      if (prevLayer.current) {
        map.setFeatureState(
          {
            source: sourceId,
            sourceLayer: prevLayer.current,
            id: selected.current,
          },
          { selected: false },
        );
      }

      map.setFeatureState(
        {
          source: sourceId,
          sourceLayer: type,
          id: selected.current,
        },
        { selected: false },
      );

      selected.current = null;
    }

    if (!selectedZone || selectedZone === selected.current) {
      return;
    }

    if (selectedZone) {
      map.setFeatureState(
        {
          source: sourceId,
          sourceLayer: type,
          id: selectedZone,
        },
        {
          selected: true,
        },
      );
      selected.current = selectedZone;
    }
  }, [map, selectedZone, type]);

  return null;
};

export default Boundaries;
