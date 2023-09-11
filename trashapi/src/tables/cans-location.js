import cans from './cans.js';
import locations, { fields } from './locations.js';
import prevLocations from './prev-locations.js';

export const cansLocationJoin = cans
  .leftJoin(locations)
  .on(cans.locationId.equals(locations.id))
  .leftJoin(prevLocations)
  .on(cans.prevLocationId.equals(prevLocations.id));

export const cansLocationFields = [cans.star(), ...fields(locations), ...fields(prevLocations)];

export default {
  select: (...additionalFields) =>
    cans.select(...cansLocationFields, ...additionalFields).from(cansLocationJoin),
};
