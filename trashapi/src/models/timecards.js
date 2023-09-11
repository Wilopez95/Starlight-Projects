import R from 'ramda';
import _debug from 'debug';

import timecards from '../tables/timecards.js';
import { dateRange, dateTimeFrmt } from '../utils/format.js';
import universal from './universal.js';
import { byDriverName } from './filters.js';

const debug = _debug('api:models:timecards');

const TRUE = timecards.literal('TRUE');
const byDriverId = ({ driverId }) => (driverId ? timecards.driverId.equals(driverId) : TRUE);

const byDateRange = ({ date }) =>
  R.test(dateRange.format, date)
    ? dateRange(
        (start, end) =>
          timecards.startTime.between(start, end).or(timecards.stopTime.between(start, end)),
        date,
      )
    : TRUE;

const byId = ({ id }) => (id ? timecards.id.equals(id) : TRUE);

const byDeleted = ({ deleted }) => (deleted === '1' ? TRUE : timecards.deleted.notEqual('TRUE'));

export const findAll = R.curry(async (req, query) => {
  const { query: httpQuery } = req;
  const cardsQuery = timecards
    .select()
    .where(byDriverId(httpQuery))
    .where(byId(httpQuery))
    .where(byDeleted(httpQuery))
    .where(byDateRange(httpQuery))
    .order(timecards.id);

  const driverName = await byDriverName(req, timecards);
  cardsQuery.where(driverName);

  return query(cardsQuery);
});

export const findById = universal.findById(
  R.curry((httpQuery, query) =>
    query(timecards.select().where(byId(httpQuery)).where(byDeleted(httpQuery))),
  ),
);

const singular = universal.singular(timecards, findById);

const transformTimecardsDate = obj => {
  const { startTime, stopTime } = obj;
  debug(obj);
  return {
    ...obj,
    ...(startTime ? { startTime: dateTimeFrmt(startTime) } : {}),
    ...(stopTime ? { stopTime: dateTimeFrmt(stopTime) } : {}),
  };
};
export const create = (object, ...rest) => singular.create(transformTimecardsDate(object), ...rest);

export const update = (id, object, ...rest) =>
  singular.update(...[id, transformTimecardsDate(object), ...rest]);

export const { remove } = singular;

export default { findAll, findById, create, update, remove };
