import assert from 'assert';
import R, { compose as o } from 'ramda';
import { expect } from '../../helpers/request';
import { invalid, notFound } from '../common';
import cans from '../../../src/tables/cans';
import cansLocation from '../../../src/tables/cans-location';
import { one } from '../../../src/utils/query';
import mockCan from '../../fixtures/can';
import mockLocation from '../../fixtures/location';
import { up, clear, toUTC } from '../../helpers/data';
import constants from '../../../src/utils/constants';

export const beforeEach = up(cans)(R.times(mockCan, 5));

export const afterEach = clear;

const {
  location: {
    type: { LOCATION, TRUCK },
  },
} = constants;

const transactionFields = ['timestamp', 'action'];

const excludeLocationFields = prefix =>
  R.map(R.concat(prefix), [
    'Id',
    'Location',
    'Name',
    'Type',
    'WaypointType',
    'WaypointName',
    'CreatedBy',
    'CreatedDate',
    'ModifiedBy',
    'ModifiedDate',
  ]);

const cleanDbFields = o(
  toUTC('startDate'),
  R.omit([
    ...transactionFields,
    ...excludeLocationFields('location'),
    ...excludeLocationFields('prevLocation'),
    'createdBy',
    'createdDate',
    'modifiedBy',
    'modifiedDate',
  ]),
);

const cleanResFields = R.over(
  R.lensProp('body'),
  R.omit([
    ...transactionFields,
    'location',
    'prevLocation',
    'createdBy',
    'createdDate',
    'modifiedBy',
    'modifiedDate',
  ]),
);

export default {
  async success(request) {
    const can = cleanDbFields(await one(cansLocation.select()));
    const { body } = cleanResFields(
      await expect(200, request({ canId: can.id })),
    );
    assert(R.is(Object, body));
    assert.deepEqual(can, R.omit(['transactions'], body));
    assert(body.transactions.length);
  },
  notFound: notFound(cans, 'canId', 'id'),
  invalid: invalid('canId'),
  successWithTransactions: async (request, api) => {
    const can = cleanDbFields(await one(cansLocation.select()));
    await api.moveCan({ canId: can.id }).send(mockLocation(LOCATION, false));
    await api.moveCan({ canId: can.id }).send(mockLocation(LOCATION, false));
    await api
      .pickupCan({ canId: can.id })
      .send(mockLocation(TRUCK, false))
      .expect(204);
    const { body } = await expect(200, request({ canId: can.id }));

    assert.equal(body.transactions.length, 3);
  },
};
