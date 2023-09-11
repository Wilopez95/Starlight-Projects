import React, { useContext, useEffect } from 'react';
import circle from '@turf/circle';
import { observer } from 'mobx-react-lite';
import { ThemeContext } from 'styled-components';

import { outlineWidth } from '@root/consts';
import { Units } from '@root/i18n/config/units';

import { MapContext } from './MapContext';
import { IRadius } from './types';

const sourceId = 'radius';
const fillId = 'radius-fill';
const lineId = 'radius-line';

const Radius: React.FC<IRadius> = ({ coordinates, radius, units }) => {
  const map = useContext(MapContext);
  const { colors } = useContext(ThemeContext);
  // eslint-disable-next-line no-negated-condition
  const validRadius = !isNaN(radius) ? radius : 0;

  const circleGeoJson = circle(coordinates, validRadius, {
    units: units === Units.metric ? 'meters' : 'yards',
  });

  useEffect(() => {
    if (!map) {
      return;
    }

    const mapSource = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

    if (mapSource) {
      mapSource.setData(circleGeoJson);

      return;
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: circleGeoJson,
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

    map.addLayer({
      id: lineId,
      type: 'line',
      source: sourceId,
      layout: {},
      paint: {
        'line-width': outlineWidth,
        'line-color': colors.primary.standard,
      },
    });

    return () => {
      if (map.getLayer(fillId)) {
        map.removeLayer(fillId);
      }
      if (map.getLayer(lineId)) {
        map.removeLayer(lineId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [
    map,
    radius,
    coordinates,
    units,
    colors.primary.standard,
    colors.primary.desaturated,
    circleGeoJson,
  ]);

  return null;
};

export default observer(Radius);
