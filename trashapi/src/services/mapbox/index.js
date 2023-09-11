import isEmpty from 'lodash/isEmpty.js';

import mbxClient from '@mapbox/mapbox-sdk';
import geocodingService from '@mapbox/mapbox-sdk/services/geocoding.js';

import fetch from 'node-fetch';
import { MAPBOX_ACCESS_TOKEN, NODE_ENV, USE_MAPBOX_PERMANENT_ENDPOINT } from '../../config.js';
import logger from '../logger/index.js';
import constants from '../../utils/constants.js';
import { REGION } from '../../consts/regions.js';

const baseClient = mbxClient({ accessToken: MAPBOX_ACCESS_TOKEN });
const geocodingClient = geocodingService(baseClient);

class HTTPResponseError extends Error {
  constructor(response, ...args) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`, ...args);
    this.response = response;
  }
}

const checkStatus = response => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response;
  }
  // @TODO: Check the Eleks Service Error and maybe throw that?
  throw new HTTPResponseError(response);
};
const {
  location: {
    type: { LOCATION },
  },
} = constants;

const isProduction = NODE_ENV === 'production' || NODE_ENV === 'prod';
const mapboxEndpoint =
  isProduction && USE_MAPBOX_PERMANENT_ENDPOINT ? 'mapbox.places-permanent' : 'mapbox.places';

/**
 * It extracts the address details from the mapped response.body.features array and formats them into a single object
 * @param obj - The object that contains the address details.
 * @returns an object with the following properties:
 */
const extractAndFormatDetails = obj =>
  obj.context.reduce((details, item) => {
    if (item?.id) {
      if (item?.id?.startsWith('postcode')) {
        details.zip = item?.text;
      } else if (item?.id?.startsWith('place')) {
        details.city = item?.text;
      } else if (item?.id?.startsWith('region') && item?.short_code) {
        const state = item?.short_code?.split('-');
        details.state = state[state.length - 1];
      } else if (item?.id?.startsWith('country') && item?.short_code) {
        details.country = item?.short_code?.toLocaleUpperCase();
      }
    }
    return details;
  }, {});

/**
 * Strip the string preceding the address to prevent storing the "Place Name" in the address field.
 * @param  {string} address - The address to be cleaned.
 * @returns {string} The address without the first part of the address.
 * @example Ball Arena, 1000 Chopper Cir, Denver, CO 80202, USA -> 1000 Chopper Cir, Denver, CO 80202, USA
 */
export const stripStringPrecedingAddress = address => {
  if (address.split(',').length >= 5) {
    return address.replace(/^[^0-9]*/, '');
  }
  return address;
};

/**
 * Given a mapbox response object, return the street address of the place
 * @param mapboxRespObj - The response object from the Mapbox API.
 * @returns The street address of the location.
 */
export const setStreetAddress = mapboxRespObj => {
  if (mapboxRespObj?.matching_place_name) {
    return mapboxRespObj.matching_place_name.split(',')[0];
  }
  if (mapboxRespObj?.address && mapboxRespObj?.text) {
    return `${mapboxRespObj.address} ${mapboxRespObj.text}`;
  }
  if (!mapboxRespObj?.address && mapboxRespObj?.matching_text) {
    return mapboxRespObj.matching_text;
  }
  return '';
};

/**
 * Given an address, return true if the address contains an intersection
 * @param {string} address - The address of the business.
 * @returns a boolean value.
 */
export const isIntersection = address => {
  const addressFirstPart = address.split(',')[0];
  return !!addressFirstPart.match(/and|&/);
};

export const mapboxIntersectionRequest = async (
  isAmpAnd,
  addressPart1,
  addressPart2,
  proximity,
) => {
  const andUrl = isAmpAnd ? '%20&%20' : '%20and%20';
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/${mapboxEndpoint}/${encodeURIComponent(
      addressPart1,
    )}${andUrl}${encodeURIComponent(addressPart2)}.json?types=${encodeURIComponent(
      'address',
    )}&proximity=${encodeURIComponent(proximity)}&access_token=${encodeURIComponent(
      MAPBOX_ACCESS_TOKEN,
    )}`,
    {
      method: 'GET',
    },
  );

  try {
    checkStatus(response);

    return await response.json();
  } catch (error) {
    return logger.error(error);
  }
};

export const handleIntersectionAddress = async (
  addressPartOfQuery,
  isAmpAnd,
  longitude,
  latitude,
) => {
  const street1 = addressPartOfQuery.split(/and|&/)[0]?.trim();
  const street2 = addressPartOfQuery.split(/and|&/)[1]?.trim();
  const mapboxRes = await mapboxIntersectionRequest(
    isAmpAnd,
    street1,
    street2,
    `${longitude},${latitude}`,
  );
  if (
    mapboxRes &&
    !isEmpty(mapboxRes.features) &&
    mapboxRes.features[0]?.properties?.accuracy === 'intersection'
  ) {
    return mapboxRes.features.map(obj => {
      const addressDetails = extractAndFormatDetails(obj);
      const intersectionAddress = obj?.place_name.split(',')[0];
      return {
        location: {
          lat: obj.geometry.coordinates[1],
          lon: obj.geometry.coordinates[0],
        },

        name: `${intersectionAddress}, ${addressDetails.city}, ${addressDetails.state} ${addressDetails.zip}, ${addressDetails.country}`.trim(),
      };
    });
  }
  return {
    error: 'No results found',
  };
};
/**
 * This function takes in a query string and returns a list of addresses that match the query
 * @param {Object} searchObj - The search query object.
 * @param {string} searchObj.query - The address to be geocoded
 * @param {number} searchObj.limit - The maximum number of results to return default is 5
 * @param {string} searchObj.region - The region to search in. Default is US
 * @param {Number} searchObj.longitude - The longitude of the location to search around.
 * @param {Number} searchObj.latitude - The latitude of the location to search around.
 * @returns An array of locations that are formatted for the database.
 */
export const searchAddress = async ({
  query,
  limit = 5,
  region = REGION.usa,
  longitude = 0,
  latitude = 0,
}) => {
  if (query.split(',').length < 3) {
    return false;
  }
  let startOfAddress;
  // @TODO: Needs to be refactor to look prettier with less ifs
  if (isIntersection(query)) {
    const addressPartOfQuery = query.split(',')[0];
    const isAmpAnd = addressPartOfQuery.match(/&/);
    if (addressPartOfQuery.split(/and|&/).length === 2) {
      // eslint-disable-next-line no-return-await
      return await handleIntersectionAddress(addressPartOfQuery, isAmpAnd, longitude, latitude);
    }
  }
  const cleanedQuery = stripStringPrecedingAddress(query);

  const mapboxOptions = {
    query: cleanedQuery,
    mode: mapboxEndpoint,
    autocomplete: true,
    // bbox: bounds,
    limit,
    types: ['address', 'place', 'neighborhood', 'postcode'],
    countries: [region],
  };
  if (longitude !== 0 && latitude !== 0) {
    mapboxOptions.proximity = `${longitude},${latitude}`;
  }
  const response = await geocodingClient.forwardGeocode(mapboxOptions).send();

  if (response && response.body && !isEmpty(response.body.features)) {
    return response.body.features.map(obj => {
      const addressDetails = extractAndFormatDetails(obj);

      startOfAddress = setStreetAddress(obj);

      return {
        location: {
          lat: obj.geometry.coordinates[1],
          lon: obj.geometry.coordinates[0],
        },

        name: `${startOfAddress}, ${addressDetails.city}, ${addressDetails.state} ${addressDetails.zip}, ${addressDetails.country}`.trim(),
      };
    });
  }
  return {
    error: 'No results found',
  };
};

/**
 * It takes the locSeed object, consisting of latitude, longitude, and potentially type and reverse geocodes it to get the address.
 * @param {Object} locSeed - The search query object.
 * @param {number} locSeed.latitude - The location latitude to be geocoded
 * @param {number} locSeed.longitude - The location longitude to be geocoded
 * @param {string} [locSeed.type] - The location type (LOCATION, WAYPOINT, TRUCK)
 * @returns An array of objects with the following properties:
 */
export const reverseAddressLookup = async ({ latitude, longitude, type }) => {
  try {
    if (!latitude || !longitude) {
      return;
    }
    const response = await geocodingClient
      .reverseGeocode({
        query: [longitude, latitude],
        mode: mapboxEndpoint,
        // Set the factors that are used to sort nearby results. (optional, default 'distance')
        reverseMode: 'distance',
        types: ['address'],
        countries: ['us'],
      })
      .send();
    if (response && response.body && !isEmpty(response.body.features)) {
      response.body.features.map(obj => {
        const addressDetails = extractAndFormatDetails(obj);
        // addressDetails ---------------------- { zip: '81089', city: 'Walsenburg', state: 'CO', country: 'US' }
        return {
          location: {
            lat: obj.geometry.coordinates[1],
            lon: obj.geometry.coordinates[0],
          },
          type: !type || /,/.test(type) ? LOCATION : type,
          name: `${obj.address || ''} ${obj.text || ''}, ${addressDetails.city}, ${
            addressDetails.state
          } ${addressDetails.zip}, ${addressDetails.country}`.trim(),
        };
      });
    }
  } catch (error) {
    logger.error(error);
  }
};
