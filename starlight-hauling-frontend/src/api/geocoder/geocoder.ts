import { accessToken } from '@root/config/mapbox';
import { IAddress } from '@root/types/entities/address';
import { Position } from 'geojson';

export const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
export class MapboxGeocoderService {
  async getPlace(address?: IAddress): Promise<Position> {
    return new Promise((resolve, reject) => {
      const location = `${address?.addressLine1} ${address?.city}, ${address?.state} ${address?.zip}`;
      const url = encodeURI(`${baseUrl}${location}.json?access_token=${accessToken}&limit=1`);

      fetch(url)
        .then(res => res.json())
        .then(
          result => {
            resolve(result.features[0].center as Position);
          },
          error => {
            console.log('There was a problem with the request: ', error);
            reject(null);
          },
        );
    });
  }
}
