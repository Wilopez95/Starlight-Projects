import sql from 'node-sql-2';
import R from 'ramda';
import turf from '@turf/turf';
import { subDays } from 'date-fns';
import { foldP } from '../utils/functions';
import { my } from '../utils/query.js';

const query = sql => ({
  toQuery: () => ({ text: sql, values: [] }),
});

export const up = table => seed => async () => {
  await my(table.insert(seed));
};

export const down = table => async () => {
  await my([
    query('SET FOREIGN_KEY_CHECKS = 0'),
    table.truncate(),
    query('SET FOREIGN_KEY_CHECKS = 1'),
  ]);
};

const clearTables = R.compose(
  R.map(down),
  R.map(name => sql.define({ name, columns: [] })),
  R.filter(R.complement(R.equals('migrations'))),
  R.map(R.prop('table_name')),
);

export const clear = async () => {
  const results = await my(
    query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema='trash_test1'
  `),
  );
  await foldP(async (_, truncate) => truncate(), null, clearTables(results));
};

export const all = 5;

export const toUTC = R.uncurryN(2, prop => R.over(R.lensProp(prop), R.invoker(0, 'toISOString')));

export const end = subDays(new Date(), 2);
export const begin = subDays(end, 4);

export const rightBbox = [-105.11, 39.61, -104.62, 39.91];
export const wrongBbox = [73.07, 54.82, 73.66, 55.18];

export const point = bbox => {
  const {
    features: [
      {
        geometry: {
          coordinates: [lon, lat],
        },
      },
    ],
  } = turf.random('points', 1, {
    bbox,
  });
  return { lat, lon };
};

import { format } from 'date-fns';

export const date = (from, to) => `${format(new Date(from), 'T')}..${format(new Date(to), 'T')}`;

export const isOdd = R.modulR.compose(R.__, 2);

export const { 0: evens, 1: odds } = R.countBy(isOdd, R.times(R.identity, all));

const planTests = type => R.times(R.concat([type]), all);

export const toCreate = R.compose(R.chain(R.identity), R.map(planTests), R.keys);

export const upAPI = (mockGens, itemsToCreate) => api =>
  R.reduce(
    (acc, [type, i]) => acc.then(() => mockGens[type](api, i)),
    Promise.resolve(),
    itemsToCreate,
  );

export const dates = R.compose(...R.map(toUTC, ['modifiedDate', 'createdDate']));

export const compareArrays = (arr1, arr2) => R.equals(arr1, arr2);
