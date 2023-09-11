import { multiPolygon, polygon } from '@turf/helpers';
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
  Position,
} from 'geojson';

import { FeatureLike } from '../types';

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

export const multiPolygonalFeatureToPolygons = (feature: Feature) => {
  const geometry = feature.geometry;

  if (geometry.type !== 'MultiPolygon') {
    return [feature];
  }

  const subPolygons = geometry.coordinates;

  return subPolygons.map(subPolygon => polygon(subPolygon)) as Feature[];
};

export const featureSetToGeometrySet = (featureSet?: FeatureLike[]) => {
  return (featureSet ?? []).map(feature => feature.geometry as Polygon | MultiPolygon);
};
