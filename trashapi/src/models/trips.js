import R from 'ramda';
import trips from '../tables/trips.js';
import { dateRange } from '../utils/format.js';
import timecards from '../tables/timecards.js';
import universal from './universal.js';
import { byDriverName } from './filters.js';

const TRUE = trips.literal('TRUE');

const byId = ({ id }) => (id ? trips.id.equals(id) : TRUE);

const byTripID = ({ tripType }) => (tripType ? trips.tripType.equals(tripType) : TRUE);

const byDriverId = ({ driverId }) => (driverId ? trips.driverId.equals(driverId) : TRUE);

const byDeleted = ({ deleted }) => (deleted === '1' ? TRUE : trips.deleted.notEqual('TRUE'));

const byDateRange = ({ date }) =>
  R.test(dateRange.format, date)
    ? dateRange((start, end) => trips.createdDate.between(start, end), date)
    : TRUE;

export const findAll = R.curry(async (req, query) => {
  const { query: httpQuery } = req;
  const tripsQuery = trips
    .select()
    .where(byTripID(httpQuery))
    .where(byDriverId(httpQuery))
    .where(byId(httpQuery))
    .where(byDeleted(httpQuery))
    .where(byDateRange(httpQuery));

  const driverName = await byDriverName(req, timecards);
  tripsQuery.where(driverName);

  return query(tripsQuery);
});

export const findById = universal.findById(
  R.curry((httpQuery, query) =>
    query(trips.select().where(byId(httpQuery)).where(byDeleted(httpQuery))),
  ),
);

const singular = universal.singular(trips, findById);

export const { create } = singular;

export const update = R.curry(async (id, trip, user, query) => {
  const prepare = R.compose(R.omit(['id']));

  return await singular.update(id, prepare(trip), user, query);
});

export const { remove } = singular;

export default { findAll, findById, create, update, remove };
