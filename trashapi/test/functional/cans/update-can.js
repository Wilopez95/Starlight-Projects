import assert from 'assert';
import R, { pipeP as pipe } from 'ramda';
import { expect } from '../../helpers/request';
import { notFound, invalid, pipeline } from '../common';
import cans from '../../../src/tables/cans';
import transactions from '../../../src/tables/transactions';
import { my } from '../../../src/utils/query';
import constants from '../../../src/utils/constants';
import mockCan from '../../fixtures/can';
import { up, clear, toUTC } from '../../helpers/data';
import { formatISO, format } from 'date-fns';

const {
  can: {
    action: { UPDATE },
  },
} = constants;

const numberOfCans = 5;

export const before = pipe(clear, up(cans)(R.times(mockCan, numberOfCans)));

export const after = clear;

const clean = R.omit([
  'name',
  'location',
  'locationId',
  'prevLocation',
  'prevLocationId',
  'action',
  'timestamp',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
]);

export default {
  success: async request => {
    const [can] = await my(cans.select());
    const { body } = await expect(
      202,
      request({ canId: can.id }).send({
        ...can,
        name: 'New Name',
      }),
    );
    assert(R.is(Object, body));
    assert.deepEqual(toUTC('startDate', clean(can)), R.omit(['transactions'], clean(body)));
    assert.equal(R.length(await my(cans.select())), numberOfCans);
    const [transaction] = await my(transactions.select());
    assert(transaction);
    assert.equal(body.action, UPDATE);
    assert.equal(transaction.action, UPDATE);
    assert.equal(transaction.canId, can.id);
    assert.equal(body.transactions[0].id, transaction.id);
  },
  'API-224 timestamp should not be changed on update': async () => {
    const [can] = await my(cans.select());
    await my(
      await cans
        .update({
          name: 'New Name',
        })
        .where(cans.id.equals(can.id)),
    );
    const [updatedCan] = await my(cans.select());
    assert.equal(formatISO(can.timestamp), formatISO(updatedCan.timestamp));
  },
  'API-224 timestamp should be changed on update': async request => {
    const [can] = await my(cans.select());
    const timestamp = format(new Date('2017-05-26 23:59:59'), 'yyyy-MM-dd HH:mm:ss');
    await my(
      await cans
        .update({
          name: 'New Name',
          timestamp,
        })
        .where(cans.id.equals(can.id)),
    );
    const [updatedCan] = await my(cans.select());
    assert.equal(timestamp, format(updatedCan.timestamp, 'yyyy-MM-dd HH:mm:ss'));
    const { body } = await expect(
      202,
      request({ canId: can.id }).send({
        ...can,
        name: 'New Name',
      }),
    );
    assert.notEqual(timestamp, format(body.timestamp, 'yyyy-MM-dd HH:mm:ss'));
  },
  'API-210 transaction timestamp should not be changed on update': async () => {
    const [transaction] = await my(transactions.select());
    await my(
      await transactions
        .update({
          action: 'MOVE',
        })
        .where(transactions.id.equals(1)),
    );
    const [updated] = await my(transactions.select());

    assert.equal(formatISO(transaction.timestamp), formatISO(updated.timestamp));
    assert.notEqual(formatISO(transaction.timestamp), formatISO(updated.modifiedDate));
  },
  notFound: notFound(cans, 'canId', 'id'),
  'pickup-can from null location': async (request, api) => {
    const { body: can } = await api.createCan().send({
      ...mockCan({ name: 'wrong location' }),
      location: { name: 'from null location' },
    });
    await request({ canId: can.id }).send({ name: 'to null location' }).expect(202);
  },
  invalid: pipeline(invalid('canId'), async request => {
    const [can] = await my(cans.select());
    await expect(400, request({ canId: can.id }).send([]));
  }),
};
