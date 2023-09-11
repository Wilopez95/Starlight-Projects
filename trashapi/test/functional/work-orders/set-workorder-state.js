import assert from 'assert';
import R from 'ramda';
import sinon from 'sinon';
import workOrders from '../../../src/tables/workorders';
import constants from '../../../src/utils/constants';
import { expect } from '../../helpers/request';
import { clear } from '../../helpers/data';
import mockCan from '../../fixtures/can';
import mockLocation from '../../fixtures/location';
import mockWorkOrder from '../../fixtures/workorder';
import { notFound } from '../common';

import * as twilioLib from '../../../src/utils/twilio';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const {
  can: {
    action: { PICKUP, DROPOFF },
  },
  location: {
    type: { LOCATION, TRUCK },
  },
  workOrder: {
    material,
    action: { DUMP_AND_RETURN, RELOCATE, REPOSITION, GENERAL_PURPOSE },
    status: { ASSIGNED },
    note: {
      transitionState: {
        START_WORK_ORDER,
        ARRIVE_ON_SITE,
        START_SERVICE,
        FINISH_SERVICE,
        PICKUP_CAN,
        DROP_CAN,
        SPECIAL_INSTRUCTIONS,
        WORK_ORDER_COMPLETE,
      },
      type: { TRANSITION },
    },
  },
} = constants;

const body = R.prop('body');

let workOrder;
let can;
let sandbox;

export const before = async () => {
  sandbox = sinon.sandbox.create();
  sandbox.stub(twilioLib, 'sendSMS').returns('hello');
  await clear();
};

export const beforeEach = async api => {
  can = await api
    .createCan()
    .send({
      ...mockCan(),
      location: mockLocation(LOCATION, false),
    })
    .then(body);
  workOrder = await api
    .createWorkorder()
    .send({
      secretPass,
      ...mockWorkOrder({}),
      location1: can.location,
    })
    .then(body);
};

export const afterEach = async () => {
  sandbox.restore();
  await clear();
};

const Sam = {
  name: 'Sam',
  truck: {
    name: 'Bumblebee',
  },
};

const Tryptican = {
  name: 'Tryptican',
  serial: 'deceptican1',
  hazardous: 1,
  size: 30,
  location: {
    name: 'Griffith Observatory',
    type: LOCATION,
    location: {
      lat: 34.118545,
      lon: -118.300075,
    },
  },
};

const Insectican = {
  name: 'Insectican',
  serial: 'deceptican2',
  hazardous: 1,
  size: 12,
  location: {
    name: 'Griffith Observatory',
    type: LOCATION,
    location: {
      lat: 34.12,
      lon: -118.31,
    },
  },
};

const makeUpdateStateForGeneralPurpose = (
  workOrderId,
  canId,
  request,
) => newState =>
  request({ workOrderId, newState })
    .query({ canId })
    .send()
    .then(body);

export default {
  'no location': async request => {
    const { body: woNote } = await expect(
      201,
      request({
        workOrderId: workOrder.id,
        newState: START_WORK_ORDER,
      }).send({}),
    );
    assert.equal(woNote.workOrderId, workOrder.id);
    assert.equal(woNote.type, TRANSITION);
    assert.equal(woNote.note.newState, START_WORK_ORDER);
    assert(!woNote.location.id);
  },

  'with location': async request => {
    const fakeLocation = mockLocation(LOCATION, false);
    const { body: woNote } = await expect(
      201,
      request({
        workOrderId: workOrder.id,
        newState: FINISH_SERVICE,
      }).send(fakeLocation),
    );
    assert.equal(woNote.workOrderId, workOrder.id);
    assert.equal(woNote.type, TRANSITION);
    assert.equal(woNote.note.newState, FINISH_SERVICE);
    assert.equal(woNote.location.type, LOCATION);
    assert.equal(woNote.location.name, fakeLocation.name);
    assert.equal(woNote.location.location.lat, fakeLocation.location.lat);
    assert.equal(woNote.location.location.lon, fakeLocation.location.lon);
  },

  transitions: async (request, api) => {
    // these decepticans terrorise the streets nowdays
    await api.createCan().send(mockCan());
    const deceptican = await api
      .createCan()
      .send(Tryptican)
      .then(body);
    const deceptican2 = await api
      .createCan()
      .send(Tryptican)
      .then(body);
    const insectican = await api
      .createCan()
      .send(Insectican)
      .then(body);

    // let's hire Sam to make him clean the streets up from decepticans
    const sam = await api
      .createDriver()
      .send(Sam)
      .then(body);

    // and put some instructions for him
    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: DUMP_AND_RETURN,
        status: ASSIGNED,
        driverId: sam.id,
        material: material[0],
        instructions: `Pick this creeping deceptican up and
                     move him out of the city, buddy`,
        size: deceptican.size,
        location1: deceptican.location,
      })
      .then(body);

    const orderForAlex = await api
      .createWorkorder()
      .send({
        secretPass,
        action: DUMP_AND_RETURN,
        status: ASSIGNED,
        driverId: sam.id,
        material: material[0],
        instructions: `Pick this creeping deceptican up and
                     move him out of the city, buddy`,
        size: deceptican.size,
        location1: deceptican.location,
      })
      .then(body);

    // in the previous series Sam has picked up insectacan and has not dropped
    // it off yet. however it should not prevent him to do his current job
    await expect(
      201,
      request({
        workOrderId: orderForSam.id,
        newState: PICKUP_CAN,
      })
        .send(insectican.location)
        .query({ canId: insectican.id }),
    );

    // Sam's journey begins
    await request({
      workOrderId: orderForSam.id,
      newState: START_WORK_ORDER,
    }).send({ name: 'Home', type: LOCATION });

    await request({
      workOrderId: orderForSam.id,
      newState: ARRIVE_ON_SITE,
    }).send(deceptican.location);

    const executingWorkOrder = await api
      .viewWorkorder({
        workOrderId: orderForSam.id,
      })
      .then(body);
    assert.equal(executingWorkOrder.step, ARRIVE_ON_SITE);

    await request({
      workOrderId: orderForSam.id,
      newState: START_SERVICE,
    }).send(deceptican.location);

    // ooh Bumblebee sends wrong location, something with his navigation system
    await expect(
      201,
      request({
        workOrderId: orderForAlex.id,
        newState: PICKUP_CAN,
      })
        .send({})
        .query({ canId: deceptican2.id }),
    );

    // and something messed up with deceptican id
    await expect(
      400,
      request({
        workOrderId: orderForSam.id,
        newState: PICKUP_CAN,
      })
        .send(deceptican.location)
        .query({}),
    );
    await expect(
      404,
      request({
        workOrderId: orderForSam.id,
        newState: PICKUP_CAN,
      })
        .send(deceptican.location)
        .query({ canId: deceptican.id + 10 }),
    );

    // ok, Sam is already on site and can pick up this freaking deceptican now
    const pickUpState = await request({
      workOrderId: orderForSam.id,
      newState: PICKUP_CAN,
    })
      .send(deceptican.location)
      .query({ canId: deceptican.id })
      .then(body);
    assert.equal(pickUpState.workOrderId, orderForSam.id);
    assert.deepEqual(
      {
        newState: PICKUP_CAN,
        canId: deceptican.id,
      },
      pickUpState.note,
    );
    assert.deepEqual(pickUpState.location, deceptican.location);

    const updatedDeceptican = await api
      .viewCan({
        canId: deceptican.id,
      })
      .then(body);
    assert.equal(updatedDeceptican.action, PICKUP);
    assert.deepEqual(updatedDeceptican.location, sam.truck);

    // but what if our mate Sam forget that he already picked tryptican up
    await expect(
      409,
      request({
        workOrderId: orderForSam.id,
        newState: PICKUP_CAN,
      })
        .send(deceptican.location)
        .query({ canId: deceptican.id }),
    );

    // let's check if tryptican in the truck
    const currentState = await api
      .getWorkorderState({
        workOrderId: orderForSam.id,
      })
      .then(body);
    assert.equal(currentState.note.newState, PICKUP_CAN);
    assert.equal(currentState.note.canId, deceptican.id);
    assert.equal(currentState.can.id, deceptican.id);
    assert.equal(currentState.can.name, deceptican.name);

    // ok let's drop off this deceptican in the ocean
    const dropOffState = await expect(
      201,
      request({
        workOrderId: orderForSam.id,
        newState: DROP_CAN,
      }).send({
        name: 'Ocean',
        type: LOCATION,
        location: {
          lat: 33.717163,
          lon: -118.816445,
        },
      }),
    ).then(body);
    assert.equal(dropOffState.workOrderId, orderForSam.id);
    assert.equal(dropOffState.note.newState, DROP_CAN);
    // not that the location in the transitions came from the request
    assert.equal(dropOffState.location.name, 'Ocean');

    const droppedDeceptican = await api
      .viewCan({
        canId: deceptican.id,
      })
      .then(body);
    assert.equal(droppedDeceptican.action, DROPOFF);
    // but the location for the can is from the location1
    assert.deepEqual(droppedDeceptican.location, deceptican.location);

    const completedOrder = await api
      .viewWorkorder({
        workOrderId: orderForSam.id,
      })
      .then(body);
    assert.equal(completedOrder.step, DROP_CAN);
    // jeez, that was tough! streets are safe now, no more decepticans
  },

  'should cover destination time fow WO': async (request, api) => {
    await api.createCan().send(mockCan());
    const insectican = await api
      .createCan()
      .send(Insectican)
      .then(body);

    const sam = await api
      .createDriver()
      .send({
        ...Sam,
        truck: {
          ...Sam.truck,
          location: {
            lon: 1,
            lat: 2,
          },
        },
      })
      .then(body);

    // and put some instructions for him
    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: DUMP_AND_RETURN,
        status: ASSIGNED,
        driverId: sam.id,
        material: material[0],
        textOnWay: 'super duper value for test coverage',
        size: insectican.size,
        location1: insectican.location,
      })
      .then(body);

    await request({
      workOrderId: orderForSam.id,
      newState: START_WORK_ORDER,
    }).send({ name: 'Home', type: LOCATION });
  },

  'should keep silent on SMS error': async (request, api) => {
    await api.createCan().send(mockCan());
    const insectican = await api
      .createCan()
      .send(Insectican)
      .then(body);

    const sam = await api
      .createDriver()
      .send({
        ...Sam,
        truck: {
          ...Sam.truck,
          location: {
            lon: 1,
            lat: 2,
          },
        },
      })
      .then(body);

    // and put some instructions for him
    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: DUMP_AND_RETURN,
        status: ASSIGNED,
        driverId: sam.id,
        material: material[0],
        textOnWay: 'super duper value for test error',
        size: insectican.size,
        location1: insectican.location,
      })
      .then(body);

    await request({
      workOrderId: orderForSam.id,
      newState: START_WORK_ORDER,
    }).send({ name: 'Home', type: LOCATION });
  },

  'should cover destination time fow WO whwre time is not found': async (
    request,
    api,
  ) => {
    await api.createCan().send(mockCan());
    const insectican = await api
      .createCan()
      .send(Insectican)
      .then(body);

    const sam = await api
      .createDriver()
      .send({
        ...Sam,
        truck: {
          ...Sam.truck,
          location: {
            lon: 1,
            lat: 2,
          },
        },
      })
      .then(body);

    // and put some instructions for him
    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: DUMP_AND_RETURN,
        status: ASSIGNED,
        driverId: sam.id,
        material: material[0],
        textOnWay: '123',
        size: insectican.size,
        location1: insectican.location,
      })
      .then(body);

    await request({
      workOrderId: orderForSam.id,
      newState: START_WORK_ORDER,
    }).send({ name: 'Home', type: LOCATION });
  },

  'relocate a can': async (request, api) => {
    // let's hire Sam again
    const sam = await api
      .createDriver()
      .send(Sam)
      .then(body);

    const deceptican = await api
      .createCan()
      .send({
        ...Tryptican,
        location: sam.truck,
      })
      .then(body);

    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: RELOCATE,
        status: ASSIGNED,
        driverId: sam.id,
        size: deceptican.size,
        material: material[0],
        location1: deceptican.location,
        location2: {
          name: 'Destination',
          type: LOCATION,
        },
      })
      .then(body);

    const dropOffState = await request({
      workOrderId: orderForSam.id,
      newState: DROP_CAN,
    })
      .query({ canId: deceptican.id })
      .send({ name: 'Ocean' })
      .then(body);

    assert.equal(dropOffState.workOrderId, orderForSam.id);
    assert.equal(dropOffState.note.newState, DROP_CAN);
    // not that the location in the transitions came from the request
    assert.equal(dropOffState.location.name, 'Ocean');

    const droppedDeceptican = await api
      .viewCan({
        canId: deceptican.id,
      })
      .then(body);
    assert.equal(droppedDeceptican.action, DROPOFF);
    // but the location for the can is from the location2 because RELOCATE
    assert.equal(droppedDeceptican.location.name, 'Destination');
  },

  'API-181 - transitions for GENERAL_PURPOSE': async (request, api) => {
    const sam = await api
      .createDriver()
      .send(Sam)
      .then(body);

    const deceptican = await api
      .createCan()
      .send({
        ...Tryptican,
        location: sam.truck,
      })
      .then(body);

    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: GENERAL_PURPOSE,
        status: ASSIGNED,
        driverId: sam.id,
        size: deceptican.size,
        textOnWay: '123',
        material: material[0],
        location1: deceptican.location,
      })
      .then(body);

    const updateStateForGeneralPurpose = makeUpdateStateForGeneralPurpose(
      orderForSam.id,
      deceptican.id,
      request,
    );

    await updateStateForGeneralPurpose(START_WORK_ORDER);
    const startWO = await api
      .viewWorkorder({ workOrderId: orderForSam.id })
      .then(body);

    await updateStateForGeneralPurpose(ARRIVE_ON_SITE);
    const AOS = await api
      .viewWorkorder({ workOrderId: orderForSam.id })
      .then(body);

    await updateStateForGeneralPurpose(SPECIAL_INSTRUCTIONS);
    const special = await api
      .viewWorkorder({ workOrderId: orderForSam.id })
      .then(body);

    await updateStateForGeneralPurpose(WORK_ORDER_COMPLETE);
    const complete = await api
      .viewWorkorder({ workOrderId: orderForSam.id })
      .then(body);

    assert.equal(startWO.step, START_WORK_ORDER);
    assert.equal(AOS.step, ARRIVE_ON_SITE);
    assert.equal(special.step, SPECIAL_INSTRUCTIONS);
    assert.equal(complete.step, WORK_ORDER_COMPLETE);
  },

  'API-195 - reposition a can': async (request, api) => {
    // let's hire Sam again
    const sam = await api
      .createDriver()
      .send(Sam)
      .then(body);

    const deceptican = await api
      .createCan()
      .send({
        ...Tryptican,
        location: sam.truck,
      })
      .then(body);

    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: REPOSITION,
        status: ASSIGNED,
        driverId: sam.id,
        size: deceptican.size,
        location1: deceptican.location,
        location2: {
          name: 'Destination',
          type: LOCATION,
        },
      })
      .then(body);

    const dropOffState = await request({
      workOrderId: orderForSam.id,
      newState: DROP_CAN,
    })
      .query({ canId: deceptican.id })
      .send({ name: 'Ocean', type: '987' })
      .then(body);

    assert.equal(dropOffState.workOrderId, orderForSam.id);
    assert.equal(dropOffState.note.newState, DROP_CAN);
    // not that the location in the transitions came from the request
    assert.equal(dropOffState.location.name, 'Ocean');

    const droppedDeceptican = await api
      .viewCan({
        canId: deceptican.id,
      })
      .then(body);
    assert.equal(droppedDeceptican.action, DROPOFF);
    // but the location for the can is from the location2 because REPOSITION
    assert.equal(droppedDeceptican.location.name, 'Destination');
  },

  'drop off to null location': async (request, api) => {
    // let's hire Sam again
    const sam = await api
      .createDriver()
      .send(Sam)
      .then(body);

    const deceptican = await api
      .createCan()
      .send({
        ...Tryptican,
        location: sam.truck,
      })
      .then(body);

    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: DROPOFF,
        status: ASSIGNED,
        driverId: sam.id,
        size: deceptican.size,
        location1: deceptican.location,
        location2: {
          name: 'Destination',
          type: LOCATION,
        },
      })
      .then(body);

    const dropOffState = await request({
      workOrderId: orderForSam.id,
      newState: DROP_CAN,
    })
      .query({ canId: deceptican.id, prevLocationId: null })
      .send({})
      .then(body);

    assert.equal(dropOffState.workOrderId, orderForSam.id);
    assert.equal(dropOffState.note.newState, DROP_CAN);
    // not that the location in the transitions came from the request

    assert.equal(dropOffState.location.name, null);
    assert.equal(dropOffState.location.id, null);
    assert.equal(dropOffState.location.location.lat, null);
    assert.equal(dropOffState.location.location.lon, null);

    const droppedDeceptican = await api
      .viewCan({
        canId: deceptican.id,
      })
      .then(body);
    assert.equal(droppedDeceptican.action, DROPOFF);
    // but the location for the can is from the location2 because REPOSITION
    assert.equal(droppedDeceptican.location.name, null);
    assert.equal(droppedDeceptican.location.id, null);
    assert.equal(droppedDeceptican.location.location.lat, null);
    assert.equal(droppedDeceptican.location.location.lon, null);
  },

  'pick up from null location': async (request, api) => {
    // let's hire Sam again
    const sam = await api
      .createDriver()
      .send(Sam)
      .then(body);

    const deceptican = await api
      .createCan()
      .send({
        ...Tryptican,
        location: { id: null },
      })
      .then(body);

    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: PICKUP_CAN,
        status: ASSIGNED,
        driverId: sam.id,
        size: deceptican.size,
        location1: deceptican.location,
        location2: {
          name: 'Destination',
          type: LOCATION,
        },
      })
      .then(body);
    const pickup = await request({
      workOrderId: orderForSam.id,
      newState: PICKUP_CAN,
    })
      .query({ canId: deceptican.id, prevLocationId: null })
      .send({})
      .then(body);

    assert.equal(pickup.workOrderId, orderForSam.id);
    assert.equal(pickup.note.newState, PICKUP_CAN);
    // not that the location in the transitions came from the request

    assert.equal(pickup.location.name, null);
    assert.equal(pickup.location.id, null);
    assert.equal(pickup.location.location.lat, null);
    assert.equal(pickup.location.location.lon, null);

    const pikedDeceptican = await api
      .viewCan({
        canId: deceptican.id,
      })
      .then(body);

    assert.equal(pikedDeceptican.action, PICKUP);
    // but the location for the can is from the location2 because REPOSITION
    assert.equal(pikedDeceptican.location.name, sam.truck.name);
    assert.equal(pikedDeceptican.location.id, sam.truck.id);
  },

  'API-195 - undo a pickup can by dropping it': async (request, api) => {
    const sam = await api
      .createDriver()
      .send(Sam)
      .then(body);

    const deceptican = await api
      .createCan()
      .send(Tryptican)
      .then(body);

    const orderForSam = await api
      .createWorkorder()
      .send({
        secretPass,
        action: PICKUP_CAN,
        status: ASSIGNED,
        driverId: sam.id,
        size: deceptican.size,
        material: material[0],
        location1: deceptican.location,
      })
      .then(body);

    await request({
      workOrderId: orderForSam.id,
      newState: PICKUP_CAN,
    })
      .send(deceptican.location)
      .query({ canId: deceptican.id })
      .then(body);

    const locationToUndo = await api
      .createLocation()
      .send({
        name: 'Test location',
        type: LOCATION,
      })
      .then(body);

    // undo pick up by dropping the can
    const dropOffState = await request({
      workOrderId: orderForSam.id,
      newState: DROP_CAN,
    })
      .send({ name: 'GPS', type: '956' })
      .query({
        canId: deceptican.id,
        prevLocationId: locationToUndo.id,
      })
      .then(body);

    assert.equal(dropOffState.location.name, 'GPS');

    const droppedDeceptican = await api
      .viewCan({
        canId: deceptican.id,
      })
      .then(body);
    assert.equal(droppedDeceptican.location.id, locationToUndo.id);
  },

  'transition validations - no truck': async (request, api) => {
    const orderNoTruck = await api
      .createWorkorder()
      .send({
        secretPass,
        action: DUMP_AND_RETURN,
        status: ASSIGNED,
        material: material[0],
        size: 12,
      })
      .then(body);

    await expect(
      400,
      request({
        workOrderId: orderNoTruck.id,
        newState: DROP_CAN,
      }).send({
        name: 'Optimus Prime',
        type: TRUCK,
      }),
    );

    const can = await api
      .createCan()
      .send({
        location: {
          name: 'Home',
          type: LOCATION,
        },
      })
      .then(body);

    await expect(
      400,
      request({
        workOrderId: orderNoTruck.id,
        newState: PICKUP_CAN,
      })
        .send({
          name: 'Truck',
          type: TRUCK,
        })
        .query({ canId: can.id }),
    );
  },

  'not found': notFound(workOrders, 'workOrderId', 'id'),
};
