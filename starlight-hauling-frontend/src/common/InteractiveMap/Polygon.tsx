import React, { useContext, useEffect } from 'react';
import { ThemeContext } from 'styled-components';

import { outlineWidth } from '@root/consts';

import { MapContext } from './MapContext';
import { IPolygon } from './types';

const sourceId = 'polygon';
const lineId = 'polygon-line';
const fillId = 'polygon-fill';

const Polygon: React.FC<IPolygon> = ({ coordinates }) => {
  const map = useContext(MapContext);
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    if (!map) {
      return;
    }

    const data: GeoJSON.Feature<GeoJSON.Geometry> = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates,
      },
      properties: {},
    };

    const mapSource = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

    if (mapSource) {
      mapSource.setData(data);

      return;
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data,
    });

    map.addLayer({
      id: lineId,
      type: 'line',
      source: sourceId,
      layout: {},
      paint: {
        'line-color': colors.primary.standard,
        'line-width': outlineWidth,
      },
    });

    map.addLayer({
      id: fillId,
      type: 'fill',
      source: sourceId,
      layout: {},
      paint: {
        'fill-color': colors.primary.standard,
        'fill-opacity': 0.5,
      },
    });

    return () => {
      map.removeLayer(lineId);
      map.removeLayer(fillId);
      map.removeSource(sourceId);
    };
  }, [coordinates, map, colors.primary.standard]);

  return null;
};

export default Polygon;
