import bbox from '@turf/bbox';
import { BBox, GeometryCollection, Point } from 'geojson';

import { IMapMergeData } from '@root/types';

export const POSITION_COORDINATES_DIVIDER = 4;

export const getMarkersBoundingBox = (
  features: Pick<IMapMergeData, 'coordinates'>[],
): BBox | null => {
  const geometries: Point[] = [];

  features.forEach(feature => {
    geometries.push({
      type: 'Point',
      coordinates: feature.coordinates,
    });
  });

  const geometry: GeometryCollection = {
    type: 'GeometryCollection',
    geometries,
  };

  return bbox(geometry);
};
