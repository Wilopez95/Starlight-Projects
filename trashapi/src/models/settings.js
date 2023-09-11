import R from 'ramda';

import settings from '../tables/settings.js';
import { foldP } from '../utils/functions.js';
import { err } from '../utils/errors.js';
import { list } from '../utils/format.js';
import universal from './universal.js';

const TRUE = settings.literal('TRUE');

const byId = ({ id }) => (id ? settings.id.equals(id) : TRUE);

const byBusinessUnitId = ({ businessUnitId }) =>
  businessUnitId ? settings.haulingBusinessUnitId.equals(businessUnitId) : TRUE;

const byBusinessUnitIds = ({ businessUnitIds }) =>
  businessUnitIds?.length ? settings.haulingBusinessUnitId.in(list(businessUnitIds)) : TRUE;

const byKeys = ({ keys }) => (keys?.length ? settings.key.in(list(keys)) : TRUE);

export const findAll = R.curry((httpQuery, query) =>
  query(
    settings
      .select()
      .where(byId(httpQuery))
      .where(byKeys(httpQuery))
      .where(byBusinessUnitId(httpQuery))
      .where(byBusinessUnitIds(httpQuery))
      .order(settings.id),
  ),
);

export const findById = universal.findById(findAll);

const singular = universal.singular(settings, findById);

export const create = R.curry(async (value, user, query) => {
  if (value.key === '') {
    const errorMsg = `Key shouldn't be am empty string! ${` element: ${JSON.stringify(value)}`}`;
    throw err(errorMsg, 400);
  }
  value.haulingBusinessUnitId = value.businessUnitId;
  const prepare = R.compose(
    R.omit(['id', 'businessUnitId']),
    R.over(R.lensProp('value'), JSON.stringify),
  );
  // eslint-disable-next-line no-return-await
  return await singular.create(prepare(value), user, query);
});

export const update = R.curry(async (id, value, user, query) => {
  const prepare = R.compose(
    R.omit(['id', 'businessUnitId']),
    R.over(R.lensProp('value'), JSON.stringify),
  );
  if (value.businessUnitId) {
    value.haulingBusinessUnitId = value.businessUnitId;
  }
  // eslint-disable-next-line no-return-await
  return await singular.update(id, prepare(value), user, query);
});

const getSettingsUniqueKey = ({ key, haulingBusinessUnitId, businessUnitId }) =>
  `${key}|${haulingBusinessUnitId ?? businessUnitId}`;

export const bulk = R.curry(async (settingSeeds, user, query) => {
  const settingsArray = await findAll({})(query);
  const searchObj = settingsArray.reduce((accumulator, item) => {
    accumulator[getSettingsUniqueKey(item)] = item.id;
    return accumulator;
  }, {});
  return foldP(
    async (result, settingSeed) =>
      R.concat(
        result,
        await (searchObj[getSettingsUniqueKey(settingSeed)]
          ? update(searchObj[getSettingsUniqueKey(settingSeed)], settingSeed, user)
          : create(settingSeed, user))(query),
      ),
    [],
    settingSeeds,
  );
});

export const remove = R.curry((id, user, query) => query(settings.delete().where({ id })));

export const bulkDelete = R.curry(async (reqQuery, user, query) => {
  const settingsToDelete = await findAll(reqQuery, query);
  return foldP(
    async (result, settingToDelete) =>
      R.concat(result, await remove(settingToDelete.id, user)(query)),
    [],
    settingsToDelete,
  );
});

export default { findAll, update, bulk, bulkDelete };
