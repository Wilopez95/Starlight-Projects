import R from 'ramda';
import HttpStatus from 'http-status';
import locations, { editableFields } from '../tables/locations.js';
import { ValidationError } from '../services/error/index.js';
import cans from '../tables/cans.js';
import { searchAddress, reverseAddressLookup } from '../services/mapbox/index.js';
import { l } from '../utils/query.js';
import logger from '../services/logger/index.js';
import { list } from '../utils/format.js';
import { REGIONS } from '../consts/regions.js';
import { getCompany } from './companies.js';
import universal from './universal.js';

const TRUE = locations.literal('TRUE');

export const humanReadableDBError = (error, { name, latitude, longitude }) => {
  if (error.code === '23505') {
    // eslint-disable-next-line
    error.code = 400;
    // eslint-disable-next-line
    error.message =
      `Database error: Duplicate entry for "name": "${name}"` +
      ` and "latitude": "${latitude}" and "longitude": "${longitude}" fields in table locations!`;
  }
  return error;
};

export const contains = (location, bounds) => {
  const [neLng, neLat, swLng, swLat] = bounds?.split(',') || [];
  if (!neLng || !neLat || !swLng || !swLat) {
    return TRUE;
  }
  return location.latitude.between(swLat, neLat).and(location.longitude.between(swLng, neLng));
};

const setCoordinates = location => {
  const { latitude, longitude, location: { x, y, lat, lon } = {} } = location;

  location.latitude = latitude ?? lat ?? y ?? null;
  location.longitude = longitude ?? lon ?? x ?? null;
  return location;
};

const byCoordinates = ({ coordinates }) => {
  const [longitude, latitude] = coordinates?.split(',') || [];
  if (!latitude || !longitude) {
    return TRUE;
  }
  return locations.latitude.equals(latitude).and(locations.longitude.equals(longitude));
};

const byId = ({ id }) => (id ? locations.id.equals(id) : TRUE);

const byName = ({ name }) =>
  name
    ? locations.name
        .ilike(l(name))
        .or(locations.waypointName.ilike(l(name)))
        .or(locations.description.ilike(l(name)))
    : TRUE;

const byType = ({ type }) => (type ? locations.type.in(list(type)) : TRUE);

const byEmpty = ({ empty }) => (empty ? cans.id.isNull() : TRUE);

const byDeleted = ({ deleted }) => (deleted === '1' ? TRUE : locations.deleted.equals('FALSE'));

const locationsFrom = ({ empty }) =>
  empty ? locations.leftJoin(cans).on(locations.id.equals(cans.locationId)) : locations;

export const findAll = R.curry((httpQuery, query) =>
  query(
    locations
      .select(locations.star())
      .from(locationsFrom(httpQuery))
      .where(byId(httpQuery))
      .where(byName(httpQuery))
      .where(byCoordinates(httpQuery))
      .where(byType(httpQuery))
      .where(byEmpty(httpQuery))
      .where(byDeleted(httpQuery)),
  ),
);

export const findByNameTypeLocation = R.curry(({ name, type, coordinates }, query) =>
  query(
    locations
      .select(locations.star())
      .from(locations)
      .where(locations.name.equals(name))
      .where(locations.type.equals(type))
      .where(byCoordinates({ coordinates })),
  ),
);

export const findById = universal.findById(findAll);

const singular = universal.singular(locations, findById);

export const create = R.curry(async (location, user, query) => {
  if (
    location.type === 'WAYPOINT' &&
    // eslint-disable-next-line
    (location.waypointName === '' || location.waypointName == null)
  ) {
    throw new ValidationError('waypointName is required', HttpStatus.BAD_REQUEST);
  }
  const prepare = R.compose(R.pick(editableFields), setCoordinates);
  return await singular.create(prepare(location), user, query);
});

export const update = R.curry(async (id, location, user, query) => {
  try {
    const prepare = R.compose(R.pick(editableFields), setCoordinates);
    return await singular.update(id, prepare(location), user, query);
  } catch (error) {
    throw humanReadableDBError(error, location);
  }
});

export const { remove } = singular;

export default {
  findAll,
  findById,
  create,
  update,
  remove,
  findByNameTypeLocation,
};

const cleanParams = R.omit(['geocoding']);

const clean = R.pipe(
  cleanParams,
  R.omit(['location', 'lat', 'lon', 'coordinates']),
  R.when(R.propSatisfies(R.isNil, 'waypointType'), R.omit(['waypointType'])),
);

const pickUniqueKeyFields = R.pick(['type', 'longitude', 'latitude', 'name']);

export const find = R.curry((locSeed, query) => query(locations.select().where(clean(locSeed))));

export const getLocation = R.curry(async (locSeed, user, query) => {
  let locationSeed = locSeed;
  const { id, name, latitude, longitude, type } = locationSeed;
  if (!id && !name && !(latitude && longitude && type)) {
    return { id: null };
  }

  // try to find this location seed in the database, if we already have one
  const results = await query(
    locations.select().where(
      locations.seedName
        .equals(name)
        .or(locations.name.equals(name))
        .or(locations.id.equals(id))
        .or(
          locations.type
            .equals(type)
            .and(locations.longitude.equals(longitude))
            .and(locations.latitude.equals(latitude)),
        ),
    ),
  );
  // check the results array for an id matching locSeed.id
  let location = R.find(R.propEq('id', parseInt(id, 10)), results);
  if (!location) {
    // If not found by id then search by name
    location = R.find(R.propEq('name', name), results);
  }
  // If not found by matching name, then search seedName against name
  if (!location) {
    location = R.find(R.propEq('seedName', name), results);
  }
  // If not found by name, then search by type, longitude and latitude
  if (!location) {
    location = R.find(
      lo =>
        lo.type === type &&
        parseFloat(lo.longitude) === parseFloat(longitude) &&
        parseFloat(lo.latitude) === parseFloat(latitude),
      results,
    );
  }
  // if there is no such location, and we passed the geocoding param as a
  // property of locSeed  object, then try to find it in Mapbox's Geocoding API
  if (!location && locationSeed.geocoding) {
    const coData = await getCompany(user.tenantId);
    // eslint-disable-next-line
    locationSeed = cleanParams(locationSeed);
    const [mapboxResult] = await searchAddress({
      query: locSeed.name,
      limit: 1,
      region: REGIONS.USA,
      longitude: coData?.physical_longitude,
      latitude: coData?.physical_latitude,
    }).catch(err => logger.error(err));

    locationSeed = mapboxResult || locationSeed;
    // looks like it's possible this could return more than one result.
    // it's an obscure case that can only really show up in an import.
    // the desired behavior isn't obvious since the specifier
    // wasn't providing coordinates to begin with.
    [location] = await find({ name: locationSeed.name }, query);
  }
  // if there is such a location in our database, return it
  if (location) {
    return location;
  }
  // NOTE: locSeed.name can not be re-assigned to geolocation.name. This doesnt work...
  if (!name && locationSeed.type !== 'TRUCK') {
    const geolocation = await reverseAddressLookup(locationSeed);
    if (!geolocation) {
      return { id: null };
    }
    locationSeed.name = geolocation.name;

    const [location] = await find(pickUniqueKeyFields(locationSeed), query);

    if (location) {
      return location;
    }
  }

  location = await create(
    {
      ...locationSeed,
      name: locationSeed.name ?? `GPS_${new Date().getTime()}`,
      seedName: locationSeed.name,
      type: locationSeed.type ?? 'LOCATION',
    },
    user,
    query,
  );

  return location;
});

export const setLocationId = async (
  { location, suffix = '', prefix = 'location' } = {},
  user,
  query,
) =>
  location
    ? R.compose(
        R.omit([`${prefix}${suffix}`]),
        R.set(R.lensProp(`${prefix}Id${suffix}`), (await getLocation(location, user, query)).id),
      )
    : R.identity;
