import assert from 'assert';
import workOrders from '../../../src/tables/workorders';
import constants from '../../../src/utils/constants';
import { expect, body } from '../../helpers/request';
import { clear } from '../../helpers/data';
import mockWorkorderOrig from '../../fixtures/workorder';
import { invalid, notFound } from '../common';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const mockWorkOrder = obj => ({ secretPass, ...mockWorkorderOrig(obj) });
const {
  workOrder: {
    note: {
      transitionState: { START_WORK_ORDER, ARRIVE_ON_SITE },
      type: { TRANSITION },
    },
  },
} = constants;

let woWithState;
let woNoState;

const createWorkOrder = api =>
  body(api.createWorkorder().send(mockWorkOrder()));

export const before = async api => {
  // create a work order with one transition state
  woWithState = await createWorkOrder(api);
  await api
    .setWorkorderState({
      workOrderId: woWithState.id,
      newState: START_WORK_ORDER,
    })
    .send({ name: 'location', type: '32' });

  // create a work order without any state
  woNoState = await createWorkOrder(api);

  // create one more work order just to ensure that we select exact work order
  const wo = await createWorkOrder(api);
  await api
    .setWorkorderState({
      workOrderId: wo.id,
      newState: ARRIVE_ON_SITE,
    })
    .send({ name: 'location1', type: '12' });
};

export const after = clear;

export default {
  [`success test`]: async request => {
    const woNote = await body(
      expect(
        200,
        request({
          workOrderId: woWithState.id,
        }),
      ),
    );
    assert.equal(woNote.type, TRANSITION);
    assert.equal(woNote.note.newState, START_WORK_ORDER);
  },

  [`API-195 - should return an empty object
    if there is no transitions for work order`]: async request => {
    const woNote = await body(
      expect(
        200,
        request({
          workOrderId: woNoState.id,
        }),
      ),
    );
    assert.deepEqual(woNote, {
      location: { location: { lat: null, lon: null } },
      can: {},
      note: {},
    });
  },

  [`not found test`]: notFound(workOrders, 'workOrderId', 'id'),

  [`invalid`]: invalid('workOrderId'),
};
