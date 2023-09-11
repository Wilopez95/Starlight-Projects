import assert from 'assert';
import workOrderNotes from '../../../src/tables/wo-notes';
import { my } from '../../../src/utils/query';
import { clear } from '../../helpers/data';
import mockWorkorderOrig from '../../fixtures/workorder';
import { invalid } from '../common';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const mockWorkOrder = obj => ({ secretPass, ...mockWorkorderOrig(obj) });
let workOrder;
let workOrderNote;

export const before = async api => {
  workOrder = (await api.createWorkorder().send(mockWorkOrder())).body;
  workOrderNote = (
    await api.createWoNote({ workOrderId: workOrder.id }).send({
      note: {},
    })
  ).body;
};

export const after = clear;

export default {
  async success(request) {
    await request({
      workOrderId: workOrder.id,
      workOrderNoteId: workOrderNote.id,
    }).expect(204);
    const [{ deleted }] = await my(
      workOrderNotes.select().where({
        id: workOrderNote.id,
      }),
    );
    assert.equal(deleted, 1);
  },
  notFound: async request => {
    await request({ workOrderId: '675567', workOrderNoteId: '45645' }).expect(
      204,
    );
  },
  invalid: invalid(['workOrderId', 'workOrderNoteId']),
};
