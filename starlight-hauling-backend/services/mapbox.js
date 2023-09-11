import isEmpty from 'lodash/isEmpty.js';

import mbxClient from '@mapbox/mapbox-sdk';
import geocodingService from '@mapbox/mapbox-sdk/services/geocoding.js';
import tilequeryService from '@mapbox/mapbox-sdk/services/tilequery.js';

import { MAPBOX_ACCESS_TOKEN, MAPBOX_ADMINISTRATIVE_TILESET_PREFIX } from '../config.js';
import { logger } from '../utils/logger.js';

import { REGION } from '../consts/regions.js';

const baseClient = mbxClient({ accessToken: MAPBOX_ACCESS_TOKEN });
const geocodingClient = geocodingService(baseClient);
const tilequeryClient = tilequeryService(baseClient);

export const getCoordinatesByAddress = async query => {
  const response = await geocodingClient
    .forwardGeocode({
      query,
      mode: 'mapbox.places',
      limit: 1,
      types: ['address'],
      countries: [REGION.usa, REGION.can],
    })
    .send();

  if (response && response.body) {
    const {
      features: [resultObj],
    } = response.body;

    if (!resultObj) {
      return null;
    }

    return {
      fullAddress: resultObj.place_name,
      coordinates: resultObj.geometry.coordinates,
    };
  }
  return null;
};

export const getAddressByCoordinates = async coordinates => {
  const response = await geocodingClient
    .reverseGeocode({
      query: coordinates,
      mode: 'mapbox.places',
      limit: 1,
      types: ['address'],
      countries: [REGION.usa, REGION.can],
    })
    .send();

  if (response && response.body) {
    const {
      features: [resultObj],
    } = response.body;

    if (!resultObj) {
      return null;
    }

    return {
      fullAddress: resultObj.place_name,
      coordinates: resultObj.geometry.coordinates,
    };
  }
  return null;
};

export const searchAddress = async ({ query, limit = 5, region = REGION.usa }) => {
  const coords = await getCoordinatesByAddress(query).coordinates;
  const response = await geocodingClient
    .forwardGeocode({
      query,
      mode: 'mapbox.places',
      autocomplete: true,
      limit,
      proximity: coords,
      types: ['address'],
      countries: [region],
    })
    .send();

  if (!isEmpty(response?.body?.features)) {
    return response.body.features.map(obj => {
      const addressDetails = obj.context.reduce((details, item) => {
        if (item.id) {
          if (item.id.startsWith('postcode')) {
            details.zip = item.text;
          } else if (item.id.startsWith('place')) {
            details.city = item.text;
          } else if (item.id.startsWith('region') && item.short_code) {
            const state = item.short_code.split('-');
            details.state = state[state.length - 1];
          } else if (item.id.startsWith('country') && item.short_code) {
            details.country = item.short_code.toLocaleUpperCase();
          }
        }
        return details;
      }, {});

      return {
        location: obj.geometry,
        fullAddress: obj.place_name,
        address: `${obj.address || ''} ${obj.text || ''}`.trim(),
        ...addressDetails,
      };
    });
  }
  return null;
};

export const getContainingFeatures = async (pointGeometry, region) => {
  let features = [];

  await new Promise(resolve =>
    // eslint-disable-next-line no-promise-executor-return
    tilequeryClient
      .listFeatures({
        mapIds: [`${MAPBOX_ADMINISTRATIVE_TILESET_PREFIX}_${region.toLowerCase()}`],
        coordinates: pointGeometry.coordinates,
        limit: 30,
      })
      .eachPage((error, response, next) => {
        if (error) {
          logger.warn(error.message, 'Error while retrieving containing features');

          resolve();
          return;
        }

        features = features.concat(response.body.features);

        if (response.hasNextPage()) {
          next();
        } else {
          resolve();
        }
      }),
  );

  return features;
};
