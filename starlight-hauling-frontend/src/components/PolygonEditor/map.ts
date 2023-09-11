import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { multiPolygon } from '@turf/helpers';
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Polygon,
  Position,
} from 'geojson';
import mapboxgl from 'mapbox-gl';

import { accessToken } from '@root/config/mapbox';
import { type Regions } from '@root/i18n/config/region';
import { SnapPolygonMode } from '@root/pages/SystemConfiguration/tables/ServiceAreas/components/ServiceAreasInteractive/modes';

mapboxgl.accessToken = accessToken;

interface SetupMapBoxDrawParams {
  map: mapboxgl.Map;
  country: Regions;
  lineColor: string;
  lineWidth: number;
}

interface MapBoxInitResult {
  draw: MapboxDraw;
}

type SetupMapBoxDrawFunction = (args: SetupMapBoxDrawParams) => MapBoxInitResult;

export const initMapBoxDraw: SetupMapBoxDrawFunction = ({ map, lineColor, lineWidth }) => {
  const draw = new MapboxDraw({
    keybindings: true,
    displayControlsDefault: false,
    controls: {},
    defaultMode: 'snap_polygon',
    modes: {
      ...MapboxDraw.modes,
      snap_polygon: SnapPolygonMode,
    },
    styles: [
      {
        id: 'polygon-stroke',
        type: 'line',
        paint: {
          'line-color': lineColor,
          'line-width': lineWidth,
        },
      },
      {
        id: 'polygon-fill',
        type: 'fill',
        paint: {
          'fill-color': lineColor,
          'fill-opacity': 0.5,
        },
      },
    ],
  });

  map.addControl(draw, 'top-left');

  return { draw };
};

export const polygonalFeatureCollectionToMultipolygon = (featureCollection: FeatureCollection) => {
  const coordinates = featureCollection.features.reduce(
    (acc: Position[][][], curr: Feature<Geometry, GeoJsonProperties>) => {
      acc.push((curr.geometry as Polygon).coordinates);

      return acc;
    },
    [],
  );

  return multiPolygon(coordinates);
};
