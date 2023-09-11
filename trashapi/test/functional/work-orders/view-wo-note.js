import assert from 'assert';
import workOrders from '../../../src/tables/workorders';
import workOrderNotes from '../../../src/tables/wo-notes';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import mockWorkorderOrig from '../../fixtures/workorder';
import { invalid, notFound } from '../common';
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
    const { body: woNote } = await expect(
      200,
      request({
        workOrderId: workOrder.id,
        workOrderNoteId: workOrderNote.id,
      }),
    );
    assert.deepEqual(woNote, workOrderNote);
  },
  notFound: notFound([
    [workOrders, 'workOrderId', 'id'],
    [workOrderNotes, 'workOrderNoteId', 'id'],
  ]),
  invalid: invalid(['workOrderId', 'workOrderNoteId']),
};
