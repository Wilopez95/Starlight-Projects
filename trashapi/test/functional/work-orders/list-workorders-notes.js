import assert from 'assert';
import { addDays } from 'date-fns';
import R from 'ramda';

import constants from '../../../src/utils/constants';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import mockWorkorderOrig from '../../fixtures/workorder';
import { dateFrmt } from '../../../src/utils/format';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const nearFuture = i => addDays(new Date(), i);

const mockWorkOrder = obj => ({ secretPass, ...mockWorkorderOrig(obj) });
const types = R.keys(constants.workOrder.note.type);

let wos = [];

export const before = async api => {
  const wosResponses = await Promise.all(
    R.times(() => api.createWorkorder().send(mockWorkOrder()), 3),
  );
  wos = wosResponses.map(el => el.body);
  const [wo1, wo2, wo3] = R.sort((a, b) => a.id - b.id, wos);

  const [won1, won2, won3, won4, won5] = [
    {
      type: types[0],
      note: { text: types[0] },
      modifiedDate: dateFrmt(nearFuture(1)),
    },
    {
      type: types[1],
      note: { text: types[1] },
      modifiedDate: dateFrmt(nearFuture(2)),
    },
    {
      type: types[2],
      note: { text: types[2] },
      modifiedDate: dateFrmt(nearFuture(3)),
    },
    {
      type: types[3],
      note: { text: types[3] },
      modifiedDate: dateFrmt(nearFuture(4)),
    },
    {
      type: types[4],
      note: { text: types[4] },
      modifiedDate: dateFrmt(nearFuture(5)),
    },
  ];

  await Promise.all([
    api.createWoNote({ workOrderId: wo1.id }).send(won1),
    api.createWoNote({ workOrderId: wo2.id }).send(won2),
    api.createWoNote({ workOrderId: wo2.id }).send(won3),
    api.createWoNote({ workOrderId: wo3.id }).send(won4),
    api.createWoNote({ workOrderId: wo3.id }).send(won5),
  ]);
};

export const after = clear;

export default {
  async success(request) {
    const { body: listOfWoNotes } = await expect(200, request());

    assert.equal(listOfWoNotes.length, types.length);
  },

  'API-194 - test find workordes with modifiedSince': async request => {
    const testbox = [
      {
        criteria: {
          workOrders: '',
          modifiedSince: nearFuture(2).valueOf(),
        },
        expectedLength: 3,
        expectedWoId: [2, 3, 3],
      },
      {
        criteria: {
          workOrders: '2,3',
          modifiedSince: nearFuture(2).valueOf(),
        },
        expectedLength: 3,
        expectedWoId: [2, 3, 3],
      },
      {
        criteria: {
          workOrders: '1,3',
          modifiedSince: nearFuture(4).valueOf(),
        },
        expectedLength: 1,
        expectedWoId: [3],
      },
      {
        criteria: {
          workOrders: '1',
          modifiedSince: nearFuture(5).valueOf(),
        },
        expectedLength: 0,
        expectedWoId: [],
      },
      {
        criteria: {
          workOrders: '1,2',
          modifiedSince: nearFuture(2).valueOf(),
        },
        expectedLength: 1,
        expectedWoId: [2],
      },
      {
        criteria: {
          workOrders: '1',
          modifiedSince: nearFuture(0).valueOf(),
        },
        expectedLength: 1,
        expectedWoId: [1],
      },
    ];

    const expectedWoIdFunc = R.pipe(
      R.map(R.prop('workOrderId')),
      R.sort((a, b) => a - b),
    );

    testbox.forEach(async el => {
      try {
        const { body: x } = await request().query(el.criteria);
        assert.equal(el.expectedLength, x.length);
        assert.deepEqual(el.expectedWoId, expectedWoIdFunc(x));
      } catch (err) {
        throw err;
      }
    });
  },
  'API-194 - search by type': async request => {
    const {
      body: [won],
    } = await request().query({ type: types[4] });
    assert.equal(won.type, types[4]);
  },
};
