import { Point } from 'geojson';
import { LngLatBoundsLike } from 'mapbox-gl';

export const US_CENTROID: Point = {
  type: 'Point',
  coordinates: [-98.35, 39.5],
};

export const US_BBOX: LngLatBoundsLike = [
  [-179, 15],
  [-60, 72],
];
