import assert from 'assert';
import R, { compose as o } from 'ramda';

import {
  stringError,
  numberError,
  nullError,
  bodyError,
  inArrayError,
} from '../../src/utils/validators';
import constants from '../../src/utils/constants';
import { expect, body } from '../helpers/request';
import mockWorkOrder, { statuses } from '../fixtures/workorder';
import { clear, toUTC } from '../helpers/data';

export const after = clear;

const {
  workOrder: {
    note: {
      transitionState: { REASSIGNMENT },
      type: { TRANSITION },
    },
  },
} = constants;

const dates = ['scheduledDate', 'scheduledStart', 'scheduledEnd'];

const clipFractional = R.map(
  date => R.over(R.lensProp(date), R.replace(/\.\d+Z$/, '')),
  dates,
);

const prepareDbResult = o(
  ...clipFractional,
  R.omit([
    'id',
    'driver',
    'driverId',
    'createdDate',
    'createdBy',
    'deleted',
    'canId',
    'locationId1',
    'locationId2',
    'modifiedDate',
    'modifiedBy',
    'location1',
    'location2',
  ]),
);

const prepareMockObj = o(...clipFractional, ...R.map(toUTC, dates));

export default {
  [`unassigned`]: async request => {
    const orderToCreate = mockWorkOrder({
      status: statuses.UNASSIGNED,
      cow: true,
      sos: true,
    });
    const createdOne = await body(expect(201, request().send(orderToCreate)));
    assert.deepEqual(
      prepareMockObj(orderToCreate),
      prepareDbResult(createdOne),
    );
  },

  [`test validators`]: async request => {
    const wo = {
      status: 'UNASSIGNED',
      action: 'SPOT',
      size: 40,
      material: 'C & D',
    };
    const wrongWo = {
      status: 'UNASSIGNED2',
      action: {},
      material: 'C & D4',
    };
    const createdOne = await body(expect(201, request().send(wo)));

    assert.equal(wo.action, createdOne.action);

    const createdWithWrongSize = await body(
      expect(400, request().send({ ...wo, size: '90' })),
    );

    assert.equal(createdWithWrongSize.message, bodyError);
    assert.deepEqual(createdWithWrongSize.errors, [
      { param: 'size', msg: numberError, value: '90' },
      { param: 'size', msg: inArrayError('size'), value: '90' },
    ]);

    const createdWithWrongWO = await body(expect(400, request().send(wrongWo)));

    assert.equal(createdWithWrongWO.message, bodyError);
    assert.deepEqual(createdWithWrongWO.errors, [
      { param: 'status', msg: inArrayError('status'), value: wrongWo.status },

      { param: 'action', msg: stringError, value: wrongWo.action },
      { param: 'action', msg: inArrayError('action'), value: wrongWo.action },

      { param: 'size', msg: numberError },
      { param: 'size', msg: nullError },
      { param: 'size', msg: inArrayError('size') },
      {
        param: 'material',
        msg: inArrayError('material'),
        value: wrongWo.material,
      },
    ]);
  },

  [`should create a transition step REASSIGNMENT on work order creation,
    when driverId passed and status is ASSIGNED`]: async (request, api) => {
    const driver = await body(api.createDriver().send({ name: 'Test driver' }));
    const wo = await body(
      expect(
        201,
        request().send(
          mockWorkOrder({
            status: statuses.ASSIGNED,
            driverId: driver.id,
          }),
        ),
      ),
    );

    const step = await body(api.getWorkorderState({ workOrderId: wo.id }));
    assert.equal(step.type, TRANSITION);
    assert.equal(step.note.newState, REASSIGNMENT);
  },

  [`corner case 01`]: async request => {
    await expect(
      409,
      request().send(
        mockWorkOrder({
          status: statuses.UNASSIGNED,
          driverId: 1,
        }),
      ),
    );
  },
};
