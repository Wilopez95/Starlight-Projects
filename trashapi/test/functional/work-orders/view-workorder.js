import assert from 'assert';
import R from 'ramda';
import { invalid, notFound } from '../common';
import { expect } from '../../helpers/request';
import { clear, toUTC } from '../../helpers/data';
import mockWorkorderOrig from '../../fixtures/workorder';
import { my } from '../../../src/utils/query';
import constants from '../../../src/utils/constants';
import workOrders from '../../../src/tables/workorders';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const mockWorkOrder = obj => ({ secretPass, ...mockWorkorderOrig(obj) });
const {
  workOrder: {
    status: { ASSIGNED },
  },
} = constants;

export const before = async api => {
  const { body: driver } = await api.createDriver().send({
    name: 'Sam',
    truck: {
      name: 'Bumblebee',
    },
  });
  await api.createWorkorder().send({
    ...mockWorkOrder(),
    status: ASSIGNED,
    driverId: driver.id,
  });
};
export const after = clear;

const clean = R.omit([
  'locationId1',
  'locationId2',
  'location1',
  'location2',
  'driverId',
  'driver',
  'textOnWay',
]);

const prepareDbData = R.compose(
  clean,
  ...R.map(toUTC, [
    'createdDate',
    'modifiedDate',
    'scheduledDate',
    'scheduledEnd',
    'scheduledStart',
  ]),
);

export default {
  async success(request) {
    const [row] = await my(workOrders.select());
    const { body: wo } = await expect(200, request({ workOrderId: row.id }));
    assert.deepEqual(prepareDbData(row), clean(wo));
    assert.equal(wo.driver.name, 'Sam');
    assert.equal(wo.driver.truck.name, 'Bumblebee');
  },
  notFound: notFound(workOrders, 'workOrderId', 'id'),
  invalid: invalid('workOrderId'),
};
