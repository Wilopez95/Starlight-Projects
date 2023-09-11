import R from 'ramda';
import { format } from 'date-fns';
import cans from '../tables/cans.js';
import cansLocation from '../tables/cans-location.js';
import locations from '../tables/locations.js';
import prevLocations from '../tables/prev-locations.js';
import transactions from '../tables/transactions.js';
import cansTransactions from '../tables/cans-transactions.js';
import { l } from '../utils/query.js';
import { unixTime, dateTimeFrmt, dateRange, list } from '../utils/format.js';
import { conflict, invalidInput } from '../utils/errors.js';
import constants from '../utils/constants.js';
import { getHaulingTruckById } from '../services/hauling/trucks.js';
import universal from './universal.js';
import { setLocationId, getLocation, contains } from './locations.js';

const {
  can: {
    action: { CREATE, UPDATE, REMOVE, NOTE, MOVE, PICKUP, DROPOFF, TRANSFER },
  },
  location: {
    type: { LOCATION, WAYPOINT, TRUCK },
  },
} = constants;

const GROUND = [null, WAYPOINT, LOCATION];
const WHEELS = [TRUCK];
const TRUE = cans.literal('TRUE');

const boundsFilter = bounds => contains(locations, bounds);

const withNullLocations = filter =>
  filter
    .or(locations.id.isNull())
    .or(locations.latitude.isNull().and(locations.longitude.isNull()));
const byBusinessUnitId = ({ businessUnitId }) =>
  businessUnitId ? cans.haulingBusinessUnitId.equals(businessUnitId) : TRUE;

const byBusinessUnitIds = ({ businessUnitIds }) =>
  businessUnitIds?.length ? cans.haulingBusinessUnitId.in(list(businessUnitIds)) : TRUE;

const byLocationId = ({ locationId, allowNullLocations }) => {
  if (!locationId) {
    return TRUE;
  }

  let criteria;
  String(locationId)
    .split(',')
    .forEach(id => {
      const locId = Number(id);
      if (!isNaN(locId)) {
        criteria = criteria
          ? criteria.or(cans.locationId.equals(locId))
          : cans.locationId.equals(locId);
      }
    });

  // noinspection JSUnusedAssignment
  return allowNullLocations === '1' ? withNullLocations(criteria) : criteria;
};

const bySuspensionLocationId = ({ suspensionLocationId, allowNullLocations }) => {
  if (!suspensionLocationId) {
    return TRUE;
  }

  let criteria;

  const locId = Number(suspensionLocationId);

  if (!isNaN(locId)) {
    criteria = criteria
      ? criteria.or(cans.locationId.equals(locId))
      : cans.locationId.equals(locId);
  }

  // noinspection JSUnusedAssignment
  return allowNullLocations === '1' ? withNullLocations(criteria) : criteria;
};
const bySearch = ({ search }) =>
  search
    ? cans.name
        .ilike(l(search))
        .or(cans.serial.ilike(l(search)))
        .or(locations.name.ilike(l(search)))
        .or(locations.waypointName.ilike(l(search)))
        .or(
          locations.latitude
            .isNull()
            .and(locations.longitude.isNull())
            .and(prevLocations.name.ilike(l(search))),
        )
        .or(
          locations.latitude
            .isNull()
            .and(locations.longitude.isNull())
            .and(prevLocations.waypointName.ilike(l(search))),
        )
    : TRUE;

const byBounds = ({ bounds, allowNullLocations }) =>
  bounds
    ? allowNullLocations === '1'
      ? withNullLocations(boundsFilter(bounds))
      : boundsFilter(bounds)
    : TRUE;

const onlyNotNullLocations = ({ allowNullLocations }) =>
  allowNullLocations === '0' ? locations.id.isNotNull() : TRUE;

const byModifiedSince = ({ modifiedSince }) =>
  modifiedSince ? cans.modifiedDate.gt(unixTime(modifiedSince)) : TRUE;

const byDateRange = ({ date }) =>
  R.test(dateRange.format, date)
    ? dateRange((start, end) => cans.timestamp.between(start, end), date)
    : TRUE;

const onlyRequiredMaintaince = ({ isRequiredMaintenance }) =>
  R.isNil(isRequiredMaintenance) ? TRUE : cans.requiresMaintenance.equals(isRequiredMaintenance);

const onlyOutOfService = ({ isOutOfService }) =>
  R.isNil(isOutOfService) ? TRUE : cans.outOfService.equals(isOutOfService);

const byStatus = ({ status }) => (status ? cans.action.equals(status) : TRUE);

const bySize = ({ size }) => (size ? cans.size.equals(size) : TRUE);

const byName = ({ name }) => (name ? cans.name.equals(name) : TRUE);

const bySerial = ({ serial }) => (serial ? cans.serial.equals(serial) : TRUE);

const byDeleted = ({ deleted }) => (deleted === '1' ? TRUE : cans.deleted.notEqual('TRUE'));

const byHazardous = ({ hazardous }) => (hazardous === '1' ? cans.hazardous.equals('TRUE') : TRUE);

// eslint-disable-next-line no-shadow
const withTransactions = ({ withTransactions = '1' }) => withTransactions === '1';

// eslint-disable-next-line no-shadow
const lastTransactionOnly = ({ lastTransactionOnly = '0' }) => lastTransactionOnly === '1';

const byInUse = ({ inUse }) => (inUse === '1' ? cans.inUse.equals('TRUE') : TRUE);

const byId = ({ id }) => (id ? cans.id.in(list(id)) : TRUE);

const byTruckId = ({ truckId }) => (truckId ? cans.truckId.equals(truckId) : TRUE);

const applyCansFilters = (sqlQuery, parameters) =>
  sqlQuery
    .where(byId(parameters))
    .where(byLocationId(parameters))
    .where(bySearch(parameters))
    .where(byBounds(parameters))
    .where(onlyNotNullLocations(parameters))
    .where(byModifiedSince(parameters))
    .where(byDateRange(parameters))
    .where(onlyRequiredMaintaince(parameters))
    .where(onlyOutOfService(parameters))
    .where(byStatus(parameters))
    .where(bySize(parameters))
    .where(byName(parameters))
    .where(bySerial(parameters))
    .where(byDeleted(parameters))
    .where(byHazardous(parameters))
    .where(byInUse(parameters))
    .where(bySuspensionLocationId(parameters))
    .where(byBusinessUnitId(parameters))
    .where(byBusinessUnitIds(parameters))
    .where(byTruckId(parameters));

export const findAll = R.curry((parameters, query) => {
  let result;

  if (withTransactions(parameters)) {
    const sqlQuery = lastTransactionOnly(parameters)
      ? cansTransactions.selectLast()
      : cansTransactions.select();

    result = query(
      applyCansFilters(sqlQuery, parameters).order(
        transactions.timestamp.desc,
        cans.timestamp.desc,
      ),
    );
  } else {
    result = query(
      applyCansFilters(cansLocation.select(), parameters).order(cans.name.asc, cans.timestamp.desc),
    );
  }
  return result;
});

export const findById = universal.findById(findAll);

const singular = universal.singular(cans, findById);

const setAction = R.set(R.lensProp('action'));

const startDateFrmt = R.over(R.lensProp('startDate'), dateTimeFrmt);

export const create = R.curry(async (can, user, query, req) => {
  can.timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  can.haulingBusinessUnitId = can.businessUnitId;
  const prepare = R.compose(
    startDateFrmt,
    setAction(CREATE),
    await setLocationId(
      {
        location: can.location,
      },
      user,
      query,
    ),
    R.omit(['businessUnitId']),
  );
  const createdCan = await singular.create(prepare(can), user, query);
  await query(
    transactions.insert({
      action: CREATE,
      canId: createdCan.id,
      locationId2: createdCan.locationId,
      createdBy: user.name,
    }),
  );
  const data = await findById(createdCan.id, query);
  data.truck = (await getHaulingTruckById(req, data.truckId)) ?? {};
  return data;
});

export const update = R.curry(async (id, can, user, query, req) => {
  can.timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  if (can.businessUnitId) {
    can.haulingBusinessUnitId = can.businessUnitId;
  }
  const prepare = R.compose(
    startDateFrmt,
    setAction(UPDATE),
    R.omit(['id', 'modifiedDate', 'createdDate', 'businessUnitId']),
  );
  await query(
    transactions.insert({
      action: UPDATE,
      canId: id,
      createdBy: user.name,
    }),
  );
  // eslint-disable-next-line no-return-await
  const data = await singular.update(id, prepare(can), user, query);
  data.truck = (await getHaulingTruckById(req, data.truckId)) ?? {};
  return data;
});

export const remove = R.curry(async (id, user, query) => {
  await query(
    cans
      .update({
        deleted: true,
        action: REMOVE,
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        modifiedBy: user.name,
      })
      .where({ id }),
  );
  await query(
    transactions.insert({
      action: REMOVE,
      canId: id,
      createdBy: user.name,
    }),
  );
});

export const transaction = R.curry(async (action, can, locId, user, query) => {
  const data = {
    prevLocationId: can.locationId,
    locationId: locId,
    timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    action,
    modifiedBy: user.name,
  };
  if (can.truckId !== undefined) {
    data.truckId = can.truckId;
  }
  await query(cans.update(data).where({ id: can.id }));
  await query(
    transactions.insert({
      action,
      locationId1: can.locationId,
      locationId2: locId,
      canId: can.id,
      createdBy: user.name,
    }),
  );
});

export const note = R.curry(async (id, noteBody, user, query) => {
  await query(
    transactions.insert({
      action: NOTE,
      canId: id,
      payload: JSON.stringify(noteBody),
      createdBy: user.name,
    }),
  );
});

const nullable = R.when(R.isNil, R.always('NULL'));

export default {
  findAll,
  findById,
  create,
  update,
  remove,
  transaction,
  note,
  ...R.reduce(
    (methods, [action, locTypes1, locTypes2]) =>
      R.merge(methods, {
        [action]: R.curry(async (can, locSeed, user, query) => {
          if (R.all(it => can.locationType !== it, locTypes1)) {
            throw conflict(`
          Can't ${action} a can from ${nullable(can.locationType)}.
          There ${locTypes1.length > 1 ? 'are' : 'is'} only
          ${locTypes1.length} source${locTypes1.length > 1 ? 's' : ''}
          from an asset can be ${action}:
          ${R.join(', ', R.map(nullable, locTypes1))}
        `);
          }

          const location = await getLocation(locSeed, user, query);

          if (location.id === null) {
            location.type = null;
          }

          if (R.all(it => location.type !== it, locTypes2)) {
            throw conflict(`
          Can't ${action} a can to ${nullable(location.type)}.
          There is only one source an asset can be ${action} to:
          ${R.join(', ', R.map(nullable, locTypes2))}
        `);
          }

          const isTruckNeeded = [PICKUP, TRANSFER].includes(action);
          if (isTruckNeeded && !can.truckId) {
            throw invalidInput('Please, select a truck');
          }
          if (action === DROPOFF) {
            can.truckId = null;
          }

          await transaction(action, can, location.id, user, query);
        }),
      }),
    {},
    [
      [MOVE, GROUND, GROUND],
      [PICKUP, GROUND, WHEELS],
      [DROPOFF, WHEELS, GROUND],
      [TRANSFER, WHEELS, WHEELS],
    ],
  ),
};
