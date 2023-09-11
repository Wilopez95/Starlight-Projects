import assert from 'assert';
import R, { pipeP as pipe } from 'ramda';
import { addDays } from 'date-fns';
import cans from '../../../src/tables/cans';
import locations from '../../../src/tables/locations';
import transactions from '../../../src/tables/transactions';
import { my, one } from '../../../src/utils/query';
import { dateFrmt } from '../../../src/utils/format';
import { foldP } from '../../../src/utils/functions';
import { expect } from '../../helpers/request';
import { up, clear, down, begin, date, end } from '../../helpers/data';
import mockCan from '../../fixtures/can';
import mockLocation from '../../fixtures/location';

export const pipeline =
  (...validations) =>
  (...args) =>
    R.reduce(
      (acc, validation) => acc.then(() => validation(...args)),
      Promise.resolve(),
      validations,
    );

export const notFound = R.cond([
  [
    R.is(Array),
    rules => async request => {
      await expect(
        404,
        request(
          await foldP(
            async (acc, [table, template, lookup]) =>
              R.merge(acc, {
                [template]: R.last(await my(table.select()))[lookup] + 1,
              }),
            {},
            rules,
          ),
        ),
      );
    },
  ],
  [
    R.T,
    (table, template, lookup) => async request => {
      const row = R.last(await my(table.select()));
      await expect(404, request({ [template]: row[lookup] + 1 }));
    },
  ],
]);

export const invalid = template => request =>
  expect(
    400,
    request(
      R.reduce(
        (acc, template) =>
          R.merge(acc, {
            [template]: 'invalid',
          }),
        {},
        R.unless(R.isArrayLike, R.of, template),
      ),
    ),
  );

export const beforeTransaction = (from, dest) =>
  pipe(
    up(locations)(R.times(() => mockLocation(from), 2)),
    up(locations)(mockLocation(dest)),
    async () => {
      const location = await one(locations.select().where({ type: from }));
      await up(cans)(R.assoc('locationId', location.id, mockCan()))();
    },
    down(transactions),
  );

export const afterTransaction = clear;

export const successTransaction = (action, dest) => async request => {
  const can = await one(cans.select());
  const location = await one(
    locations
      .select()
      .where(locations.type.equals(dest))
      .and(locations.id.notEqual(can.locationId)),
  );

  assert.notEqual(can.locationId, location.id);

  await request({ canId: can.id }).send(location).expect(204);

  const transaction = await one(transactions.select().where({ canId: can.id }));

  const updatedCan = await one(cans.select().where({ id: can.id }));

  assert.equal(transaction.action, action);
  assert.equal(updatedCan.action, action);
  assert.equal(updatedCan.locationId, location.id);
  assert.equal(transaction.locationId1, can.locationId);
  assert.equal(transaction.locationId2, location.id);
};

export const invalidTransaction = wrongType => async request => {
  const location = R.last(await my(locations.select().where({ type: wrongType })));
  const { id: canId } = await one(cans.select());
  await expect(409, request({ canId }).send(location));
};

export const checkLength = (query, length) => async request =>
  assert.equal(R.length(R.prop('body', await expect(200, request().query(query)))), length);

export const mockDates =
  (table, field, start = begin) =>
  async (_, i) => {
    await my(table.insert({ [field]: addDays(dateFrmt(new Date(start)), i + 1) }));
  };

export const checkDates = checkLength({ date: date(begin, end) }, end.diff(begin, 'days'));
