import { MAPBOX_ACCESS_TOKEN, MAPBOX_ADMINISTRATIVE_TILESET_ID } from '../config';
import { Point } from 'geojson';
import MapboxTileQuery from '@mapbox/mapbox-sdk/services/tilequery';
import MapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

if (!MAPBOX_ACCESS_TOKEN) {
  throw new Error('Mapbox access tocken is empty');
}
const mapboxConfig = {
  accessToken: MAPBOX_ACCESS_TOKEN,
};

const tilequeryService = MapboxTileQuery(mapboxConfig);
const geocodingService = MapboxGeocoding(mapboxConfig);

export const forwardGeocode = async (query: string): Promise<any> => {
  const request = geocodingService.forwardGeocode({
    mode: 'mapbox.places',
    query,
    types: [
      'country',
      'region',
      'postcode',
      'district',
      'place',
      'locality',
      'neighborhood',
      'address',
    ],
  });

  return request.send();
};

export const getGeoFeaturesAtPoint = async (
  point: Point,
  layers = ['county', 'city', 'country', 'state'],
): Promise<any> => {
  const request = tilequeryService.listFeatures({
    mapIds: [MAPBOX_ADMINISTRATIVE_TILESET_ID],
    coordinates: [point.coordinates[0], point.coordinates[1]],
    limit: 20,
    layers,
  } as any);

  return request.send();
};
