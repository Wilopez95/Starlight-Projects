import assert from 'assert';
import { invalid } from '../common';
import { clear } from '../../helpers/data';
import mockWorkorderOrig from '../../fixtures/workorder';
import { my } from '../../../src/utils/query';
import workOrders from '../../../src/tables/workorders';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const mockWorkOrder = obj => ({ secretPass, ...mockWorkorderOrig(obj) });
export const beforeEach = async api => {
  await api.createWorkorder().send(mockWorkOrder());
};
export const afterEach = clear;

export default {
  async success(request) {
    const [rowBefore] = await my(workOrders.select());
    await request({ workOrderId: rowBefore.id }).expect(204);
    assert.equal(rowBefore.deleted, 0);
    const [rowAfter] = await my(
      workOrders.select().where({ id: rowBefore.id }),
    );
    assert.equal(rowAfter.deleted, 1);
  },
  notFound: async request => {
    await request({ workOrderId: '456748' }).expect(204);
  },
  invalid: invalid('workOrderId'),
};
