import { MAPBOX_ACCESS_TOKEN, MAPBOX_ADMINISTRATIVE_TILESET_ID } from '../../constants';
import { Point } from 'geojson';
import MapboxClient from '@mapbox/mapbox-sdk';
import MapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import MapboxTileQuery from '@mapbox/mapbox-sdk/services/tilequery';
import { featuresToAddressOptions, AddressOption } from './featuresToAddressOptions';
import { featuresToDistrictOptions } from './featuresToDistrictOptions';
import { GetActiveOriginDistrictsQuery } from '../../graphql/api';
import { Region } from '../../i18n/region';
import { TaxDistrictType } from './types';

export const mapboxClient = MapboxClient({
  accessToken: MAPBOX_ACCESS_TOKEN,
});

export const geocodingService = MapboxGeocoding(mapboxClient);
export const tilequeryService = MapboxTileQuery(mapboxClient);

export interface PromiseCancelable<T> extends Promise<T> {
  cancel(): void;
}

export const getAdminDistrictsAtPoint = (
  point: Point,
  layers: TaxDistrictType[] = [
    TaxDistrictType.Country,
    TaxDistrictType.Primary,
    TaxDistrictType.Secondary,
    TaxDistrictType.Municipal,
  ],
) => {
  const request = tilequeryService.listFeatures({
    mapIds: [MAPBOX_ADMINISTRATIVE_TILESET_ID],
    coordinates: [point.coordinates[0], point.coordinates[1]],
    limit: 20,
    dedupe: false,
    geometry: 'polygon',
    layers,
  } as any);

  return request.send().then((response: any) => {
    return featuresToDistrictOptions(response.body.features);
  });
};

export const reverseGeocode = (lngLat: { lat: number; lng: number }) => {
  const request = geocodingService.reverseGeocode({
    mode: 'mapbox.places',
    query: [lngLat.lng, lngLat.lat],
    limit: 1,
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

  return request.send().then((response: any) => {
    return featuresToAddressOptions(response.body.features);
  });
};

export const getNearestLocation = (
  jobsite: { city: string; state: string; county: string },
  listOfOptions: GetActiveOriginDistrictsQuery['activeOriginDistricts'],
) =>
  listOfOptions.find((option) => option.city === jobsite.city) ??
  listOfOptions.find((option) => option.county === jobsite.county) ??
  listOfOptions.find((option) => option.state === jobsite.state && !option.county && !option.city);

export const forwardGeocode = (
  query: string,
  countryCode: Region,
): PromiseCancelable<AddressOption[] | null> => {
  if (!query) {
    const p = Promise.resolve(null);

    (p as any).cancel = () => {};

    return p as any;
  }

  const request = geocodingService.forwardGeocode({
    mode: 'mapbox.places',
    query,
    countries: [countryCode],
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

  const promise = request.send().then((response: any) => {
    return featuresToAddressOptions(response.body.features);
  });

  (promise as PromiseCancelable<AddressOption[] | null>).cancel = () => {
    request.abort();
  };

  return promise as any;
};
