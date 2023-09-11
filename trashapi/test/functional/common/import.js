import assert from 'assert';
import R from 'ramda';
import locations from '../../../src/tables/locations';
import { my, one } from '../../../src/utils/query';
import constants from '../../../src/utils/constants';
import { clear } from '../../helpers/data';
import { expect } from '../../helpers/request';
import { pipeline } from '.';

const {
  location: {
    type: { LOCATION },
  },
  import: {
    type: { UPDATE, DELETE },
  },
} = constants;

export default ({
  table,
  genListOfEntities,
  toCSV,
  fix,
  locs = 1,
  csvHeader,
}) => {
  const beforeEach = clear;
  const afterEach = clear;

  const cleanFields = R.map(
    R.omit([
      'scheduledEnd',
      'scheduledStart',
      'scheduledDate',
      'startDate',
      'modifiedDate',
      'timestamp',
    ]),
  );

  const equal = async (listOfEntities, fn = assert.deepEqual) =>
    fn(cleanFields(await my(table.select())), cleanFields(listOfEntities));

  const addrs = {
    '1090 Cherokee St, Denver, CO': {
      name: '1090 Cherokee St, Denver, CO 80204, USA',
      location: { y: 39.73363090000001, x: -104.9912681 },
    },
    '78 W 11th Ave, Denver, CO': {
      name: '78 W 11th Ave, Denver, CO 80204, USA',
      location: { y: 39.7336395, x: -104.9884624 },
    },
  };
  const addrsSeeds = R.keys(addrs);
  const locSeeds = R.values(addrs);
  const listOfEntities = genListOfEntities();

  const append = addresses => async request => {
    assert(!(await one(table.select())));
    await request()
      .send({ csv: await toCSV(listOfEntities, addresses) })
      .expect(204);
    equal(listOfEntities);
  };

  const update = (type, fix, shouldBeEqual = true) => async request => {
    await my(table.insert(genListOfEntities()));
    const entitiesToUpdate = R.map(fix, await my(table.select()));
    await request()
      .query({ type })
      .send({ csv: await toCSV(entitiesToUpdate, ['']) })
      .expect(204);
    await equal(
      entitiesToUpdate,
      shouldBeEqual ? assert.deepEqual : assert.notDeepEqual,
    );
  };

  const deleteFix = R.set(R.lensProp('deleted'), 1);

  const def = {
    successAppend: pipeline(append(), async () => {
      const listOfLocations = await my(locations.select());
      assert(listOfLocations.length <= listOfEntities.length * locs);
    }),

    successAppendTwoAddresses: pipeline(append(addrsSeeds), async () => {
      const locs = await my(locations.select());
      assert(R.length(locs) <= addrsSeeds.length);
      R.forEach(({ name, location, type }) => {
        const locSeed = R.find(R.propEq('name', name), locSeeds);
        assert(locSeed);
        assert.deepEqual(locSeed.location, location);
        assert.equal(type, LOCATION);
      }, locs);
    }),

    successAppendNoAddresses: pipeline(append(['']), async () => {
      assert.equal(R.length(await my(locations.select())), 0);
    }),

    successUpdate: update(UPDATE, fix),

    updateWithoutIds: update(
      UPDATE,
      R.pipe(R.omit(['id']), R.set(R.lensProp('size'), 100)),
      false,
    ),

    successDelete: update(DELETE, deleteFix),

    deleteWithoutIds: update(DELETE, R.pipe(R.omit(['id']), deleteFix), false),

    async invalid(request) {
      await expect(400, request().send({ csv: [] }));
      await expect(
        400,
        request()
          .query({ type: 'WHYDONTYOUJUSTTRYTODOSOMETHINGDUH' })
          .send({ csv: '' }),
      );
      await expect(400, request().send({ csv: 'wrong format' }));
    },

    wrongInput: async request => {
      // it happens when you try to import wrong json string
      await expect(
        400,
        request()
          // can you see this? json string cannot be multiline
          .send(
            `{
          csv: "1,2,3,3,4,5,6,7,
                1,2,3,4,5,6,7,8,"
        }`,
          )
          .set('Content-Type', 'application/json'),
      );
    },
    successImportCSVwithHeader: async request => {
      assert(!(await one(table.select())));
      const csv = R.join(',', csvHeader) + '\n' + (await toCSV(listOfEntities));
      await request()
        .send({ csv })
        .expect(204);

      const importedEntities = await my(table.select());
      assert.equal(importedEntities.length, listOfEntities.length);
    },
  };

  return { beforeEach, afterEach, def };
};
