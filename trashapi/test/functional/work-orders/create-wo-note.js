import assert from 'assert';
import config from '../../../src/config';
import { my } from '../../../src/utils/query';
import workOrders from '../../../src/tables/workorders';
import workOrderNotes from '../../../src/tables/wo-notes';
import constants from '../../../src/utils/constants';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import mockWorkorderOrig from '../../fixtures/workorder';
import { pipeline, invalid, notFound } from '../common';

const secretPass = config.get('session.secret');
const mockWorkOrder = obj => ({ secretPass, ...mockWorkorderOrig(obj) });

const {
  workOrder: {
    note: {
      type: { MANIFEST },
    },
  },
} = constants;

let workOrder;

export const before = async api => {
  workOrder = (await api.createWorkorder().send(mockWorkOrder())).body;
};

export const after = clear;

export default {
  async success(request) {
    const note = {
      type: MANIFEST,
      note: {
        quantity: 30.245,
      },
    };
    const { body: woNote } = await expect(
      201,
      request({ workOrderId: workOrder.id }).send(note),
    );
    assert.equal(woNote.workOrderId, workOrder.id);
    assert.deepEqual(woNote.note, note.note);
    const listOfWorkOrderNotes = await my(workOrderNotes.select());
    assert.equal(listOfWorkOrderNotes.length, 1);
    assert.equal(listOfWorkOrderNotes[0].id, woNote.id);
  },
  notFound: notFound(workOrders, 'workOrderId', 'id'),
  invalid: pipeline(invalid('workOrderId'), async request => {
    await expect(400, request({ workOrderId: workOrder.id }).send([]));
  }),
};
