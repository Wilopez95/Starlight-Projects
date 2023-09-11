import assert from 'assert';
import R from 'ramda';
import workOrders from '../../../src/tables/workorders';
import constants from '../../../src/utils/constants';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import mockWorkorderOrig from '../../fixtures/workorder';
import { invalid, notFound } from '../common';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const mockWorkOrder = obj => ({ secretPass, ...mockWorkorderOrig(obj) });
const types = R.keys(constants.workOrder.note.type);

let workOrder;

export const before = async api => {
  workOrder = (await api.createWorkorder().send(mockWorkOrder())).body;
  await Promise.all(
    R.times(
      i =>
        api.createWoNote({ workOrderId: workOrder.id }).send({
          type: types[i],
          note: { text: types[i] },
        }),
      types.length,
    ),
  );
};

export const after = clear;

const byType = R.reduce(
  (acc, type) =>
    R.merge(acc, {
      [`type=${type}`]: async request => {
        const { body: listOfWoNotes } = await expect(
          200,
          request({ workOrderId: workOrder.id }).query({ type }),
        );
        assert.equal(listOfWoNotes.length, 1);
        assert.equal(listOfWoNotes[0].type, type);
      },
    }),
  {},
  R.times(R.prop(R.__, types), types.length),
);

export default {
  async success(request) {
    const { body: listOfWoNotes } = await expect(
      200,
      request({ workOrderId: workOrder.id }),
    );
    assert.equal(listOfWoNotes.length, types.length);
  },
  [`search deleted`]: async (request, api) => {
    const { body: wonote } = await api
      .createWoNote({ workOrderId: workOrder.id })
      .send({
        type: types[0],
        note: { text: types[0] },
      });

    await api
      .deleteWoNote({
        workOrderId: workOrder.id,
        workOrderNoteId: wonote.id,
      })
      .query();

    const { body: wonotes } = await request({
      workOrderId: workOrder.id,
    }).query({
      type: wonote.type,
      deleted: 1,
    });

    const deletedWoNote = wonotes[0];

    assert.equal(deletedWoNote.id, wonote.id);
    assert.equal(deletedWoNote.deleted, 1);
  },
  [`search deleted with flag 0`]: async (request, api) => {
    const { body: wonote } = await api
      .createWoNote({ workOrderId: workOrder.id })
      .send({
        type: types[0],
        note: { text: types[0] },
      });

    const { body: origWonotes } = await request({
      workOrderId: workOrder.id,
    }).query();

    await api
      .deleteWoNote({
        workOrderId: workOrder.id,
        workOrderNoteId: wonote.id,
      })
      .query();

    const { body: wonotes } = await request({
      workOrderId: workOrder.id,
    }).query({
      deleted: 0,
    });

    assert.equal(origWonotes.length - 1, wonotes.length);
  },
  ...byType,
  notFound: notFound(workOrders, 'workOrderId', 'id'),
  invalid: invalid('workOrderId'),
};
