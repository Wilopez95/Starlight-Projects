import R from 'ramda';
import sizes from '../tables/sizes.js';
import { list } from '../utils/format.js';
import { onCreateValidation } from '../utils/functions.js';
import { sqlLength } from '../utils/query.js';
import universal from './universal.js';

const TRUE = sizes.literal('TRUE');

const prepareCreate = R.omit(['id', 'createdDate', 'modifiedDate']);
const prepareUpdate = R.omit(['id', 'createdDate', 'modifiedDate']);

const sortBy = ({ sort }) => (sort === 'name' ? [sqlLength(sizes.name), sizes.name] : sizes.id);

const byId = ({ id }) => (id ? sizes.id.in(list(id)) : TRUE);

const byName = ({ name }) => (name ? sizes.name.in(list(name)) : TRUE);

const byDeleted = ({ deleted }) => (deleted === '1' ? TRUE : sizes.deleted.equal('FALSE'));

export const findAll = R.curry((httpQuery, query) =>
  query(
    sizes
      .select()
      .where(byId(httpQuery))
      .where(byName(httpQuery))
      .where(byDeleted(httpQuery))
      .order(sortBy(httpQuery)),
  ),
);

export const findById = universal.findById(findAll);

const singular = universal.singular(sizes, findById);
// eslint-disable-next-line require-await
export const update = R.curry(async (id, role, user, query) =>
  singular.update(id, prepareUpdate(role), user, query),
);

export const create = R.curry(async (size, user, query) => {
  const { name } = size;
  const existingSize = await onCreateValidation({ name }, query, user, {
    findAll,
    update,
  });

  return existingSize || singular.create(prepareCreate(size), user, query);
});

export const { remove } = singular;

export default { findAll, findById, create, update, remove };
