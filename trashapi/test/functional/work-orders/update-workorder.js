import assert from 'assert';
import R from 'ramda';
import { isBefore } from 'date-fns';
import { invalid, notFound } from '../common';
import { expect, body } from '../../helpers/request';
import { clear, toUTC } from '../../helpers/data';
import mockWorkOrder from '../../fixtures/workorder';
import { my } from '../../../src/utils/query';
import constants from '../../../src/utils/constants';
import workOrders from '../../../src/tables/workorders';

import { nullError, buildReadableError } from '../../../src/utils/validators';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const {
  can: { size },
  workOrder: {
    status: { UNASSIGNED, ASSIGNED, CANCELED },
    material,
    action,
    note: {
      type: { TRANSITION },
      transitionState: { REASSIGNMENT },
    },
  },
  location: {
    type: { LOCATION },
  },
} = constants;

const assigned = {
  action: action.SPOT,
  status: ASSIGNED,
  material: material[0],
  size: size[0],
};
const unassigned = {
  action: action.SPOT,
  status: UNASSIGNED,
  material: material[0],
  size: size[0],
};

export const beforeEach = async api => {
  await api.createDefaultMaterials();
  await api.createDefaultSizes();
  await api.createWorkorder().send({ secretPass, ...mockWorkOrder(assigned) });
};
export const afterEach = clear;

const clean = R.omit([
  'status',
  'modifiedDate',
  'modifiedBy',
  'driverId',
  'driver',
  'locationId1',
  'locationId2',
  'location1',
  'location2',
  'textOnWay',
]);

const prepareResponse = clean;

const prepareDbData = R.compose(
  clean,
  ...R.map(toUTC, ['createdDate', 'scheduledDate', 'scheduledEnd', 'scheduledStart']),
);

export default {
  async success(request) {
    const [row] = await my(workOrders.select());
    const { body } = await expect(
      202,
      request({ workOrderId: row.id }).send({
        status: CANCELED,
      }),
    );
    assert.equal(body.status, CANCELED);
    assert.equal(row.status, ASSIGNED);
    assert(isBefore(row.modifiedDate, body.modifiedDate));
    assert.deepEqual(prepareDbData(row), prepareResponse(body));
  },

  async cornerCase01(request) {
    const [{ id: workOrderId }] = await my(workOrders.select());
    await expect(
      409,
      request({ workOrderId }).send(
        mockWorkOrder({
          ...unassigned,
          driverId: 1,
        }),
      ),
    );
  },

  async boolParams(request) {
    const [r] = await my(workOrders.select());

    await expect(
      202,
      request({ workOrderId: r.id }).send({
        sos: true,
        cow: true,
        permittedCan: true,
        cabOver: true,
      }),
    );

    const [row] = await my(workOrders.select());

    const { body } = await expect(
      202,
      request({ workOrderId: row.id }).send({
        sos: false,
        cow: false,
        permittedCan: false,
        cabOver: false,
        permitNumber: '',
      }),
    );

    assert.equal(row.sos, 1);
    assert.equal(row.cow, 1);
    assert.equal(row.permittedCan, 1);
    assert.equal(row.cabOver, 1);

    assert.equal(body.sos, 0);
    assert.equal(body.cow, 0);
    assert.equal(body.permittedCan, 0);
    assert.equal(body.cabOver, 0);
  },

  async reassign(request, api) {
    // create UNASSIGNED workorder
    const { id: workOrderId } = await body(
      api.createWorkorder().send({ secretPass, ...unassigned }),
    );
    // create a driver
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    // assign an order to driver
    await expect(
      202,
      request({ workOrderId }).send({
        ...assigned,
        driverId: driver1.id,
      }),
    );

    // there should no be duplicates if we update more than once
    await expect(
      202,
      request({ workOrderId }).send({
        ...assigned,
        driverId: driver1.id,
      }),
    );
    let notes = await body(api.listWoNotes({ workOrderId }));
    assert.equal(notes.length, 1);

    // check work order state
    let state = await body(api.getWorkorderState({ workOrderId }));
    assert.equal(state.workOrderId, workOrderId);
    assert.equal(state.type, TRANSITION);
    assert.equal(state.note.text, 'Assigned to Driver1');
    assert.equal(state.note.newState, REASSIGNMENT);
    assert.equal(state.note.driverId, driver1.id);

    // create a new driver
    const driver2 = await body(api.createDriver().send({ name: 'Driver2' }));
    // assign an order to the new driver
    await expect(
      202,
      request({ workOrderId }).send({
        ...assigned,
        driverId: driver2.id,
      }),
    );

    // there should be two notes with type of REASSIGNMENT
    notes = await body(api.listWoNotes({ workOrderId }));
    assert.equal(notes.length, 2);
    assert(R.all(R.pathEq(['note', 'newState'], REASSIGNMENT), notes));

    state = await body(api.getWorkorderState({ workOrderId }));
    assert.equal(state.note.text, 'Reassigned from Driver1 to Driver2');
    assert.equal(state.note.driverId, driver2.id);

    // unassign
    await expect(202, request({ workOrderId }).send(unassigned));
    notes = await body(api.listWoNotes({ workOrderId }));
    assert.equal(notes.length, 3);
    state = await body(api.getWorkorderState({ workOrderId }));
    assert.equal(state.note.newState, REASSIGNMENT);
    assert.equal(state.note.text, 'Unassigned from Driver2');
  },

  'API-181 - update workorder to GENERAL PURPOSE': async (request, api) => {
    // create UNASSIGNED workorder
    const { id: workOrderId } = await body(
      api.createWorkorder().send({ secretPass, ...unassigned }),
    );
    // create a driver
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    // assign an order to driver
    await request({ workOrderId }).send({
      secretPass,
      ...assigned,
      action: action.GENERAL_PURPOSE,
      driverId: driver1.id,
      size: null,
      material: null,
    });

    const { body: wo } = await api.viewWorkorder({ workOrderId: workOrderId });
    assert.equal(wo.action, action.GENERAL_PURPOSE);
  },
  'API-175 - update workorder with textOnWay': async (request, api) => {
    const textOnWay = 'textOnWay';
    const { id: workOrderId } = await body(
      api.createWorkorder().send({ secretPass, ...unassigned }),
    );
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    await request({ workOrderId }).send({
      ...assigned,
      action: action.GENERAL_PURPOSE,
      driverId: driver1.id,
      textOnWay,
      size: null,
      material: null,
    });

    const { body: wo } = await api.viewWorkorder({ workOrderId: workOrderId });
    assert.equal(wo.textOnWay, textOnWay);
  },

  'API-216 - update workorder with permitNumber': async (request, api) => {
    const permitNumber = 'permitNumber';
    const { id: workOrderId } = await body(
      api.createWorkorder().send({ secretPass, ...unassigned }),
    );
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    await request({ workOrderId }).send({
      ...assigned,
      action: action.GENERAL_PURPOSE,
      driverId: driver1.id,
      permitNumber,
    });

    const { body: wo } = await api.viewWorkorder({ workOrderId: workOrderId });
    assert.equal(wo.permitNumber, permitNumber);
    assert.equal(wo.permittedCan, true);
  },

  'API-216 - update workorder with PN where new permitNumber not set': async (request, api) => {
    const permitNumber = 'permitNumber';
    const { id: workOrderId } = await body(
      api.createWorkorder().send({ secretPass, ...unassigned, permitNumber }),
    );
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    await request({ workOrderId }).send({
      ...assigned,
      action: action.GENERAL_PURPOSE,
      driverId: driver1.id,
      permittedCan: false,
    });

    const { body: wo } = await api.viewWorkorder({ workOrderId: workOrderId });
    assert.equal(wo.permitNumber, permitNumber);
    assert.equal(wo.permittedCan, true);
  },

  'API-181 - update workorder from GP to GP with Size and Material': async (request, api) => {
    // create UNASSIGNED workorder
    const { id: workOrderId } = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: null,
        material: null,
      }),
    );
    // create a driver
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    // assign an order to driver
    await request({ workOrderId }).send({
      ...assigned,
      action: action.GENERAL_PURPOSE,
      driverId: driver1.id,
      size: 10,
      material: 'this value will be deleted on update',
    });

    const { body: wo } = await api.viewWorkorder({ workOrderId: workOrderId });
    assert.equal(wo.action, action.GENERAL_PURPOSE);
    assert.equal(wo.material, null);
    assert.equal(wo.size, null);
  },

  [`API-189 - shoud send error on update workorder GENERAL PURPOSE to another type
    without size`]: async (request, api) => {
    // create UNASSIGNED workorder
    const { id: workOrderId } = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: null,
        material: null,
      }),
    );
    // create a driver
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    // assign an order to driver
    const wo = {
      ...assigned,
      id: '55',
      action: action.DROPOFF,
      driverId: driver1.id,
      size: null,
      material: 'C & D',
    };
    const { body: error } = await request({ workOrderId }).send(wo);

    const expectedError = buildReadableError(nullError, 'size', 'null', wo);
    assert.equal(error.message, expectedError);
  },

  [`API-189 - shoud send error on update workorder GENERAL PURPOSE to another type
    without material`]: async (request, api) => {
    // create UNASSIGNED workorder
    const { id: workOrderId } = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: null,
        material: null,
      }),
    );
    // create a driver
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    // assign an order to driver
    const wo = {
      ...assigned,
      id: '55',
      action: action.DROPOFF,
      driverId: driver1.id,
      size: '20',
      material: null,
    };
    const { body: error } = await request({ workOrderId }).send(wo);

    const expectedError = buildReadableError(nullError, 'material', 'null', wo);
    assert.equal(error.message, expectedError);
  },

  [`API-189 - shoud not send errors on update workorder GENERAL PURPOSE to another type
    with size or material`]: async (request, api) => {
    // create UNASSIGNED workorder
    const workorder = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: null,
        material: null,
      }),
    );
    // create a driver
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    // assign an order to driver
    await request({ workOrderId: workorder.id }).send({
      ...assigned,
      action: action.DROPOFF,
      driverId: driver1.id,
      size: '10',
      material: 'C & D',
    });

    const { body: wo } = await api.viewWorkorder({ workOrderId: workorder.id });
    assert.equal(wo.material, 'C & D');
    assert.equal(wo.size, '10');
  },

  'API-181 - update workorder from GP to GP without action with Size and Material': async (
    request,
    api,
  ) => {
    // create UNASSIGNED workorder
    const { id: workOrderId } = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: 12,
        material: '40HZ',
      }),
    );
    // create a driver
    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));
    // assign an order to driver
    await request({ workOrderId }).send({
      ...assigned,
      action: undefined,
      driverId: driver1.id,
      size: '10',
      material: 'C & D',
    });
    const { body: wo } = await api.viewWorkorder({ workOrderId: workOrderId });
    assert.equal(wo.material, null);
    assert.equal(wo.size, null);
  },

  'API-235 - update workorder with new size': async (request, api) => {
    const { body: size } = await api.createSize().send({ name: '444' });

    const workorder = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: '20',
        material: 'C & D',
      }),
    );

    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));

    await expect(
      202,
      request({ workOrderId: workorder.id }).send({
        ...assigned,
        action: action.DROPOFF,
        driverId: driver1.id,
        size: size.name,
      }),
    );
    const { body: wo } = await api.viewWorkorder({ workOrderId: workorder.id });
    assert.equal(wo.size, '444');
  },

  'API-235 - should not update workorder with nonexisting size': async (request, api) => {
    await api.createSize().send({ name: '333' });
    const workorder = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: '20',
        material: 'C & D',
      }),
    );

    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));

    await expect(
      400,
      request({ workOrderId: workorder.id }).send({
        ...assigned,
        action: action.DROPOFF,
        driverId: driver1.id,
        size: '404',
      }),
    );
  },

  'API-235 - update workorder with new material': async (request, api) => {
    const { body: material } = await api.createMaterial().send({ name: 'wood' });

    const workorder = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: '20',
        material: 'C & D',
      }),
    );

    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));

    await expect(
      202,
      request({ workOrderId: workorder.id }).send({
        ...assigned,
        action: action.DROPOFF,
        driverId: driver1.id,
        material: material.name,
      }),
    );
    const { body: wo } = await api.viewWorkorder({ workOrderId: workorder.id });
    assert.equal(wo.material, 'wood');
  },

  'API-235 - should not update workorder with nonexisting material': async (request, api) => {
    await api.createMaterial().send({ name: 'iron' });
    const workorder = await body(
      api.createWorkorder().send({
        secretPass,
        ...unassigned,
        action: action.GENERAL_PURPOSE,
        size: '20',
        material: 'C & D',
      }),
    );

    const driver1 = await body(api.createDriver().send({ name: 'Driver1' }));

    await expect(
      400,
      request({ workOrderId: workorder.id }).send({
        ...assigned,
        action: action.DROPOFF,
        driverId: driver1.id,
        material: 'wood',
      }),
    );
  },

  async twoLocationsWithSameName(request, api) {
    const { id: workOrderId, location1 } = await body(
      api.createWorkorder().send({ secretPass, ...unassigned }),
    );
    const createdLocation = await body(
      api.createLocation().send({
        name: location1.name,
        type: LOCATION,
      }),
    );
    assert.equal(createdLocation.name, location1.name);
    assert.notEqual(createdLocation.id, location1.id);
    await expect(
      202,
      request({ workOrderId }).send({
        location1: createdLocation,
      }),
    );

    const updatedWo = await body(
      api.viewWorkorder({
        workOrderId: workOrderId,
      }),
    );

    assert.equal(updatedWo.location1.id, createdLocation.id);
  },
  notFound: notFound(workOrders, 'workOrderId', 'id'),
  invalid: invalid('workOrderId'),
};
