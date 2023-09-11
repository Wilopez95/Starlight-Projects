import Chance from 'chance';
import constants from '../../src/utils/constants';

const {
  trip: {
    tripType: { PRE_TRIP, POST_TRIP },
  },
} = constants;

const chance = new Chance();

/**
 * Create a mock object for trip
 * @param  {integer} truckId    Location Id
 * @param  {integer} driverId   Driver Id
 * @param  {string} createdBy  Name of driver
 * @param  {string} modifiedBy Name of driver
 * @param  {string} tripType   The type of trip
 * @return {Object}
 */
export default (
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
