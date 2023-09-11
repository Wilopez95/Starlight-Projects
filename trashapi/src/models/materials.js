import R from 'ramda';
import materials from '../tables/materials.js';
import { list } from '../utils/format.js';
import { onCreateValidation } from '../utils/functions.js';
import universal from './universal.js';

const TRUE = materials.literal('TRUE');

const prepareCreate = R.omit(['id', 'createdDate', 'modifiedDate']);
const prepareUpdate = R.omit(['id', 'createdDate', 'modifiedDate']);

const sortBy = ({ sort }) => (sort === 'name' ? materials.name : materials.id);

const byId = ({ id }) => (id ? materials.id.in(list(id)) : TRUE);

const byName = ({ name }) => (name ? materials.name.in(list(name)) : TRUE);

const byDeleted = ({ deleted }) => (deleted === '1' ? TRUE : materials.deleted.equal('FALSE'));

export const findAll = R.curry((httpQuery, query) =>
  query(
    materials
      .select()
      .where(byId(httpQuery))
      .where(byName(httpQuery))
      .where(byDeleted(httpQuery))
      .order(sortBy(httpQuery)),
  ),
);

export const findById = universal.findById(findAll);

const singular = universal.singular(materials, findById);

export const update = R.curry(async (id, material, user, query) =>
  singular.update(id, prepareUpdate(material), user, query),
);

export const create = R.curry(async (material, user, query) => {
  const { name } = material;
  const existingMaterial = await onCreateValidation({ name }, query, user, {
    findAll,
    update,
  });

  return existingMaterial || singular.create(prepareCreate(material), user, query);
});

export const { remove } = singular;

export default { findAll, findById, create, update, remove };
