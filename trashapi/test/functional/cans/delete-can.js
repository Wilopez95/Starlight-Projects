import assert from 'assert';
import { pipeP as pipe } from 'ramda';

import cans from '../../../src/tables/cans';
import transactions from '../../../src/tables/transactions';
import { my } from '../../../src/utils/query';
import { invalid } from '../common';
import mockCan from '../../fixtures/can';
import { up, clear } from '../../helpers/data';

export const before = pipe(clear, up(cans)(mockCan()));

export const after = clear;

export default {
  async success(request) {
    let [can] = await my(cans.select());
    await request({ canId: can.id }).expect(204);
    [can] = await my(cans.select().where({ id: can.id }));
    assert(can.deleted === 1);
    const [transaction] = await my(transactions.select());
    assert(transaction);
    assert.equal(transaction.action, 'REMOVE');
    assert.equal(transaction.canId, can.id);
  },
  notFound: async request => {
    await request({ canId: '456748' }).expect(204);
  },
  invalid: invalid('canId'),
};
