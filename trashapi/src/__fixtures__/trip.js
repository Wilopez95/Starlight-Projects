/* eslint-disable max-params */
import Chance from 'chance';
import constants from '../utils/constants.js';

const {
  trip: {
    tripType: { PRE_TRIP, POST_TRIP },
  },
} = constants;

const chance = new Chance();

/**
 * Create a mock object for trip
 * @param {number}  truckId     Location Id
 * @param {number}  driverId    Driver Id
 * @param {string}  createdBy   Name of driver
 * @param {string}  modifiedBy  Name of driver
 * @param {number}  odometer    The odometer value
 * @param {string}  tripType    The type of trip
 * @returns {Object} trip
 */
export const generateTrip = (
  truckId,
  driverId,
  createdBy,
  modifiedBy,
  odometer,
  tripType = chance.pickone([PRE_TRIP, POST_TRIP]),
) => {
  return {
    truckId,
    driverId,
    tripType,
    createdBy,
    modifiedBy,
    odometer,
  };
};
