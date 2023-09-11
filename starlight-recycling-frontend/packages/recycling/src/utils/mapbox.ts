import { MAPBOX_ACCESS_TOKEN } from '../constants';

export const mapboxGeocode = (value: string): string =>
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?types=address&access_token=${MAPBOX_ACCESS_TOKEN}`;
