// eslint-disable-next-line import/no-extraneous-dependencies
import { type Point } from 'geojson';
import { type LngLatBoundsLike } from 'mapbox-gl';

import { Regions } from '@root/i18n/config/region';

export const US_CENTROID: Point = { type: 'Point', coordinates: [-98.35, 39.5] };

export const US_BBOX: LngLatBoundsLike = [
  [-179, 15],
  [-60, 72],
];

export const DEFAULT_ADDRESS = {
  id: 0,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  region: Regions.US,
};
