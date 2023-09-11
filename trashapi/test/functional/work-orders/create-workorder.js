import assert from 'assert';
import R, { compose as o } from 'ramda';
import constants from '../../../src/utils/constants';
import { expect, body } from '../../helpers/request';
import mockWorkOrder from '../../fixtures/workorder';
import { clear, toUTC } from '../../helpers/data';
import {
  objectError,
  nullError,
  inArrayErrorMessage,
  buildReadableError,
} from '../../../src/utils/validators';

export const before = async api => {
  await api.createDefaultMaterials();
  await api.createDefaultSizes();
};
export const after = clear;

const {
  workOrder: {
    note: {
      transitionState: { REASSIGNMENT },
      type: { TRANSITION },
    },
    status: statuses,
    action: actions,
  },
} = constants;

const dates = ['scheduledDate', 'scheduledStart', 'scheduledEnd'];

const location1 = {
  name: 'hello',
  type: '346',
};

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
      action: actions.SPOT,
      status: statuses.UNASSIGNED,
      cow: true,
      sos: true,
    });
    const createdOne = await body(
      expect(201, request().send({ ...orderToCreate, location1 })),
    );
    assert.deepEqual(
      prepareMockObj(orderToCreate),
      prepareDbResult(createdOne),
    );
  },

  [`should create a transition step REASSIGNMENT on work order creation,
    when driverId passed and status is ASSIGNED`]: async (request, api) => {
    const driver = await body(api.createDriver().send({ name: 'Test driver' }));
    const wo = await body(
      expect(
        201,
        request().send({
          ...mockWorkOrder({
            action: actions.SPOT,
            status: statuses.ASSIGNED,
            driverId: driver.id,
          }),
          location1,
        }),
      ),
    );

    const step = await body(api.getWorkorderState({ workOrderId: wo.id }));
    assert.equal(step.type, TRANSITION);
    assert.equal(step.note.newState, REASSIGNMENT);
  },

  [`corner case 01`]: async request => {
    await expect(
      409,
      request().send({
        ...mockWorkOrder({
          size: '40CT',
          action: actions.SPOT,
          status: statuses.UNASSIGNED,
          driverId: 1,
        }),
        location1,
      }),
    );
  },
  [`API-193 - new material asphalt`]: async request => {
    await expect(
      201,
      request().send({
        ...mockWorkOrder({
          size: '40',
          action: actions.SPOT,
          status: statuses.UNASSIGNED,
          material: 'Asphalt',
        }),
        location1,
      }),
    );
  },
  [`API-189 test validation, size is null`]: async request => {
    const workOrder = {
      size: null,
      material: 'C & D',
      action: 'FINAL',
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      nullError,
      'size',
      'null',
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-189 test validation, incorrect size`]: async request => {
    const workOrder = {
      size: '34',
      material: 'C & D',
      action: 'FINAL',
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      inArrayErrorMessage,
      'size',
      '34',
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-189 test success validation, size&material is null for GP`]: async request => {
    const workOrder = {
      size: null,
      material: null,
      action: actions.GENERAL_PURPOSE,
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
    };
    await request()
      .send(workOrder)
      .expect(201);
  },
  [`API-189 test success validation`]: async request => {
    const workOrder = {
      size: '20',
      material: 'C & D',
      action: actions.FINAL,
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
    };
    await request()
      .send(workOrder)
      .expect(201);
  },
  [`API-189 test validation, material is null`]: async request => {
    const workOrder = {
      size: '20',
      material: null,
      action: 'FINAL',
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      nullError,
      'material',
      null,
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-189 test validation, incorrect material`]: async request => {
    const workOrder = {
      size: '20',
      material: 'WWW',
      action: 'FINAL',
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      inArrayErrorMessage,
      'material',
      'WWW',
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-189 test validation, empty obj location1`]: async request => {
    const workOrder = {
      size: '20',
      action: 'FINAL',
      material: 'C & D',
      driverId: 1,
      location1: {},
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      objectError,
      'location1',
      workOrder.location1,
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-189 test validation, null location1`]: async request => {
    const workOrder = {
      size: '20',
      action: 'FINAL',
      material: 'C & D',
      driverId: 1,
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      nullError,
      'location1',
      'undefined',
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-189 test validation, null scheduledDate`]: async request => {
    const workOrder = {
      size: '20',
      action: 'FINAL',
      material: 'C & D',
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: null,
    };
    const expectedError = buildReadableError(
      nullError,
      'scheduledDate',
      'null',
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-189 test validation, null action`]: async request => {
    const workOrder = {
      size: '20',
      action: null,
      material: 'C & D',
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      nullError,
      'action',
      'null',
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-189 test validation, incorrect action`]: async request => {
    const workOrder = {
      size: '20',
      action: 'WWW',
      material: 'C & D',
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      inArrayErrorMessage,
      'action',
      'WWW',
      workOrder,
    );
    const { body } = await request()
      .send(workOrder)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-181 - GENERAL PURPOSE workorder`]: async request => {
    const orderToCreate = mockWorkOrder({
      status: statuses.ASSIGNED,
      action: actions.GENERAL_PURPOSE,
      location1,
      size: null,
      material: null,
      driverId: 1,
    });

    const { body: newWO } = await request().send(orderToCreate);
    assert.deepEqual(newWO.action, orderToCreate.action);
  },
  [`API-181 - GENERAL PURPOSE workorder and set size and material to null`]: async request => {
    const orderToCreate = mockWorkOrder({
      status: statuses.ASSIGNED,
      action: actions.GENERAL_PURPOSE,
      location1,
      size: 10,
      material: 'C & D',
      driverId: 1,
    });

    const { body: newWO } = await request().send(orderToCreate);
    assert.deepEqual(newWO.action, orderToCreate.action);
    assert.equal(newWO.size, null);
    assert.equal(newWO.material, null);
  },
  [`API-189 test validation - location2 should be on RELOCATE
    action`]: async request => {
    const orderToCreate = {
      status: statuses.UNASSIGNED,
      action: actions.RELOCATE,
      location1,
      size: '20',
      material: 'C & D',
      scheduledDate: new Date(),
    };
    const expectedError = buildReadableError(
      nullError,
      'location2',
      'undefined',
      orderToCreate,
    );
    const { body } = await request()
      .send(orderToCreate)
      .expect(400);

    assert.equal(body.message, expectedError);
  },
  [`API-175 - text on way field`]: async request => {
    const textOnWay = 'textOnWay';
    const orderToCreate = mockWorkOrder({
      status: statuses.ASSIGNED,
      action: actions.GENERAL_PURPOSE,
      location1,
      textOnWay,
      size: 10,
      material: 'mater',
      driverId: 1,
    });

    const { body: newWO } = await request().send(orderToCreate);
    assert.deepEqual(newWO.textOnWay, textOnWay);
  },
  [`test validation - FINAL action should work without location2`]: async request => {
    const orderToCreate = mockWorkOrder({
      status: statuses.UNASSIGNED,
      action: actions.FINAL,
      location1,
      driverId: 1,
    });
    await expect(409, request().send(orderToCreate));
  },
  [`API-216 - permitNumber field`]: async request => {
    const permitNumber = '111QQQ';
    const orderToCreate = mockWorkOrder({
      status: statuses.ASSIGNED,
      action: actions.GENERAL_PURPOSE,
      location1,
      permitNumber,
      permittedCan: false,
      driverId: 1,
    });

    const { body: newWO } = await request().send(orderToCreate);
    assert.equal(newWO.permitNumber, permitNumber);
    assert.equal(newWO.permittedCan, true);
  },
  [`API-216 - create workOrder with permittedCan set to true`]: async request => {
    const orderToCreate = mockWorkOrder({
      status: statuses.ASSIGNED,
      action: actions.GENERAL_PURPOSE,
      location1,
      permittedCan: true,
      driverId: 1,
    });

    const { body: newWO } = await request().send(orderToCreate);
    assert.equal(newWO.permittedCan, true);
  },
  [`API-216 - workOrder without permitNumber, permittedCan set to false`]: async request => {
    const orderToCreate = mockWorkOrder({
      status: statuses.ASSIGNED,
      action: actions.GENERAL_PURPOSE,
      location1,
      permitNumber: '',
      permittedCan: false,
      driverId: 1,
    });

    const { body: newWO } = await request().send(orderToCreate);
    assert.equal(newWO.permittedCan, false);
  },

  [`API-235 - should use materials associated from database`]: async (
    request,
    api,
  ) => {
    const { body: material } = await api
      .createMaterial()
      .send({ name: 'wood' });
    const orderToCreate = mockWorkOrder({
      status: statuses.ASSIGNED,
      action: actions.FINAL,
      material: material.name,
      location1,
      permitNumber: '',
      permittedCan: false,
      driverId: 1,
    });

    const { body: newWO } = await expect(201, request().send(orderToCreate));
    assert.equal(newWO.material, 'wood');
  },

  [`API-235 - should use sizes associated from database`]: async (
    request,
    api,
  ) => {
    const { body: size } = await api.createSize().send({ name: '44' });
    const orderToCreate = mockWorkOrder({
      status: statuses.ASSIGNED,
      action: actions.FINAL,
      size: size.name,
      location1,
      permitNumber: '',
      permittedCan: false,
      driverId: 1,
    });

    const { body: newWO } = await expect(201, request().send(orderToCreate));
    assert.equal(newWO.size, '44');
  },
};
