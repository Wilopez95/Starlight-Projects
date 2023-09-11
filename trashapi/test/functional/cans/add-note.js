import assert from 'assert';
import { pipeP as pipe } from 'ramda';

import cans from '../../../src/tables/cans';
import transactions from '../../../src/tables/transactions';
import { one } from '../../../src/utils/query';
import constants from '../../../src/utils/constants';
import mockCan from '../../fixtures/can';
import { notFound, invalid } from '../common';
import { up, clear } from '../../helpers/data';

const {
  can: {
    action: { NOTE },
  },
} = constants;

export const before = pipe(clear, up(cans)(mockCan()));

export const after = clear;

export default {
  async success(request) {
    const note = {
      text: 'some text',
      pictures: [
        // this is just a 1px transparent gif
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///////' +
          'yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      ],
    };

    const can = await one(cans.select());

    assert(!(await one(transactions.select())));

    await request({ canId: can.id })
      .send(note)
      .expect(204);

    const updatedCan = await one(cans.select().where({ id: can.id }));
    const transaction = await one(transactions.select());
    assert(transaction);
    assert.equal(updatedCan.action, null);
    assert.equal(transaction.action, NOTE);
    assert.equal(transaction.canId, can.id);
    assert.deepEqual(note, JSON.parse(transaction.payload));
  },

  notFound: notFound(cans, 'canId', 'id'),
  invalid: invalid('canId'),
};
