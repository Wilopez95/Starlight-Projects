/* eslint-disable max-params */
import R from 'ramda';
import _debug from 'debug';
import workOrderNotes from '../tables/wo-notes.js';
import constants from '../utils/constants.js';
import { unixTime, list } from '../utils/format.js';
import universal from './universal.js';

const debug = _debug('api:models:wonote');

const {
  workOrder: {
    note: {
      type: { TRANSITION },
    },
  },
} = constants;

const TRUE = workOrderNotes.literal('TRUE');

const byId = ({ id }) => (id ? workOrderNotes.id.equals(id) : TRUE);

const byType = ({ type }) => (type ? workOrderNotes.type.equals(type) : TRUE);

const byModifiedSince = ({ modifiedSince }) =>
  modifiedSince ? workOrderNotes.modifiedDate.gt(unixTime(modifiedSince)) : TRUE;

const byWorkOrders = ({ workOrders }) =>
  workOrders ? workOrderNotes.workOrderId.in(list(workOrders)) : TRUE;

const byWorkOrderId = ({ workOrderId }) =>
  workOrderId ? workOrderNotes.workOrderId.equals(workOrderId) : TRUE;

const byDeleted = ({ deleted }) =>
  deleted === '1' ? TRUE : workOrderNotes.deleted.notEqual('TRUE');

export const findAll = R.curry((httpQuery, query) =>
  query(
    workOrderNotes
      .select()
      .where(byId(httpQuery))
      .where(byType(httpQuery))
      .where(byWorkOrderId(httpQuery))
      .where(byWorkOrders(httpQuery))
      .where(byModifiedSince(httpQuery))
      .where(byDeleted(httpQuery))
      .order(workOrderNotes.modifiedDate.desc),
  ),
);

export const findById = universal.findById(findAll);

const singular = universal.singular(workOrderNotes, findById);

export const create = R.curry(async (note, user, query) => {
  debug('create note', note);
  const prepare = R.over(R.lensProp('note'), JSON.stringify);
  // eslint-disable-next-line no-return-await
  return await singular.create(prepare(note), user, query);
});

export const update = R.curry(async (id, note, user, query) => {
  const prepare = R.compose(
    R.omit(['id', 'workOrderId', 'createdDate', 'modifiedDate']),
    R.over(R.lensProp('note'), JSON.stringify),
  );
  // eslint-disable-next-line no-return-await
  return await singular.update(id, prepare(note), user, query);
});

export const { remove } = singular;

export const setState = R.curry(
  async (workOrderId, newState, note, locationId, user, query) =>
    // eslint-disable-next-line no-return-await
    await create(
      {
        type: TRANSITION,
        note: { ...note, newState },
        workOrderId,
        locationId,
      },
      user,
      query,
    ),
);

export const getState = R.curry(
  async (workOrderId, query) =>
    R.head(await findAll({ type: TRANSITION, workOrderId }, query)) || {
      note: '{}',
    },
);

export default {
  findAll,
  findById,
  create,
  update,
  remove,
  setState,
  getState,
};
