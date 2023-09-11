import { lineString, point } from '@turf/helpers';
import nearestPointOnLine, { NearestPointOnLine } from '@turf/nearest-point-on-line';
import { Feature, FeatureCollection, Polygon } from 'geojson';
import { Map, MapMouseEvent, PointLike } from 'mapbox-gl';

import { SNAP_DISTANCE } from './constants';

export const toIsolatedLineStrings = (feature: Feature) => {
  if (feature.geometry.type === 'Polygon') {
    return [lineString(feature.geometry.coordinates[0])];
  }

  if (feature.geometry.type === 'MultiPolygon') {
    return feature.geometry.coordinates.map(polyCoordinates => lineString(polyCoordinates[0]));
  }

  return [];
};

export const getSnappingBBox = (e: MapMouseEvent, snapDistance = SNAP_DISTANCE) => {
  return [
    [e.point.x - snapDistance, e.point.y - snapDistance],
    [e.point.x + snapDistance, e.point.y + snapDistance],
  ] as [PointLike, PointLike];
};

export const areTwoPointsInVicinity = (
  point1: mapboxgl.Point,
  point2: mapboxgl.Point,
  vicinity: number,
) => {
  return Math.abs(point1.x - point2.x) < vicinity && Math.abs(point1.y - point2.y) < vicinity;
};

export const getSnappedPosition = (
  map: Map,
  currentLng: number,
  currentLat: number,
  features: Array<Feature>,
) => {
  let nearestPoint: NearestPointOnLine | undefined;

  features.forEach((feature: Feature) => {
    const lineStringFeatures = toIsolatedLineStrings(feature);

    lineStringFeatures.forEach(lineStringFeature => {
      const nearest: NearestPointOnLine = nearestPointOnLine(
        lineStringFeature,
        point([currentLng, currentLat]),
      );
      const minimumFoundDistance = nearestPoint?.properties?.dist ?? 0;
      const newDistance = nearest?.properties?.dist ?? 0;

      if (!nearestPoint || newDistance < minimumFoundDistance) {
        nearestPoint = nearest;
      }
    });
  });

  const pointProjection = map.project([currentLng, currentLat]);
  const nearestPointProjection = nearestPoint
    ? map.project([nearestPoint?.geometry.coordinates[0], nearestPoint?.geometry.coordinates[1]])
    : pointProjection;

  const snappedPosition =
    nearestPoint && areTwoPointsInVicinity(nearestPointProjection, pointProjection, SNAP_DISTANCE)
      ? nearestPoint.geometry.coordinates
      : [currentLng, currentLat];

  return {
    position: snappedPosition,
    nearestPoint,
  };
};

export const filterRealPolygonalFeatures = (
  featureCollection: FeatureCollection,
  drawingModeOn = false,
) => {
  // in drawing mode minimum (sufficient) amount of points is 5
  // 3 points for poly itself + 1 last point matching the first + 1 floating point caused by mousemove
  const floatingPointIncrement = drawingModeOn ? 1 : 0;

  return featureCollection.features.filter(feature => {
    const coordinates = (feature.geometry as Polygon).coordinates;

    return coordinates.length && coordinates[0].length > 3 + floatingPointIncrement;
  });
};
