import assert from 'assert';
import config from '../../../src/config';
import { clear } from '../../helpers/data';
import { body } from '../../helpers/request';
import mockWorkorder from '../../fixtures/workorder';

import {
  nullError,
  buildReadableError,
  inArrayErrorMessage,
} from '../../../src/utils/validators';

export const before = async api => {
  await api.createDefaultMaterials();
  await api.createDefaultSizes();
};
export const after = clear;
const secretPass = config.get('session.secret');
export default {
  async upload(request, api) {
    const wo1 = await body(
      api.createWorkorder().send({
        secretPass,
        ...mockWorkorder({
          instructions: 'wo1',
          location1: { lat: '', lon: '' },
        }),
      }),
    );
    const wo2 = await body(
      api.createWorkorder().send({
        secretPass,
        ...mockWorkorder({
          instructions: 'wo2',
          location1: { lat: '', lon: '' },
        }),
      }),
    );
    const result = await body(
      request().send([
        { id: wo1.id, deleted: 1 },
        {
          id: wo2.id,
          instructions: 'updated wo2',
          location1: { lat: '', lon: '' },
        },
        {
          instructions: 'third work order',
          size: '20',
          material: 'C & D',
          action: 'FINAL',
          location1: { lat: '', lon: '' },
          scheduledDate: new Date(),
        },
      ]),
    );
    await api.viewWorkorder({ workOrderId: wo1.id }).expect(404);
    const updatedWo2 = await body(
      api.viewWorkorder({
        workOrderId: wo2.id,
      }),
    );
    const createdWo3 = await body(
      api.listWorkorders().query({
        search: 'third work order',
      }),
    );
    assert.equal(createdWo3.length, 1);
    assert.equal(result[0], null);
    assert.equal(result[1].id, updatedWo2.id);
    assert.equal(result[2].id, createdWo3[0].id);
    assert.equal(updatedWo2.instructions, 'updated wo2');
    assert.equal(createdWo3[0].instructions, 'third work order');
    assert.deepEqual(updatedWo2.location1, result[1].location1);
    assert.deepEqual(createdWo3[0].location1, result[2].location1);
  },

  'API-189 - update workorders from GP to Another without material': async (
    request,
    api,
  ) => {
    const wo1 = await body(
      api.createWorkorder().send({
        secretPass,
        ...mockWorkorder({
          instructions: 'wo1',
          action: 'GENERAL PURPOSE',
          permitNumber: '',
        }),
      }),
    );
    const wo2 = await body(
      api.createWorkorder().send({
        secretPass,
        ...mockWorkorder({
          instructions: 'wo2',
          action: 'GENERAL PURPOSE',
        }),
      }),
    );

    const error = await body(
      request()
        .send([
          { id: wo1.id, deleted: 1, action: 'FINAL', size: '10' },
          { id: wo2.id, instructions: 'updated wo2' },
          mockWorkorder({ instructions: 'third work order' }),
        ])
        .expect(400),
    );

    const expectedError = buildReadableError(
      nullError,
      'material',
      'undefined',
      { id: wo1.id, deleted: 1, action: 'FINAL', size: '10' },
    );
    assert.equal(error.message, expectedError);
  },

  'API-189 - update workorders from GP to Another without size': async (
    request,
    api,
  ) => {
    const wo1 = await body(
      api.createWorkorder().send({
        secretPass,
        ...mockWorkorder({
          instructions: 'wo1',
          action: 'GENERAL PURPOSE',
          size: '20',
          material: 'C & D',
          permitNumber: '',
        }),
      }),
    );
    const wo2 = await body(
      api.createWorkorder().send({
        secretPass,
        ...mockWorkorder({
          instructions: 'wo2',
          action: 'GENERAL PURPOSE',
        }),
      }),
    );

    const error = await body(
      request()
        .send([
          { id: wo1.id, deleted: 1, action: 'FINAL' },
          { id: wo2.id, action: 'FINAL', instructions: 'updated wo2' },
          mockWorkorder({ instructions: 'third work order' }),
        ])
        .expect(400),
    );

    const updatedWo2 = await body(
      api.viewWorkorder({
        workOrderId: wo2.id,
      }),
    );
    const expectedError = buildReadableError(nullError, 'size', 'undefined', {
      id: wo1.id,
      deleted: 1,
      action: 'FINAL',
    });
    assert.equal(error.message, expectedError);
    assert.equal(updatedWo2.action, 'GENERAL PURPOSE');
  },

  'API-189 - update workorders from Another to GP, size and material should be null': async (
    request,
    api,
  ) => {
    const wo1 = await body(
      api.createWorkorder().send({
        size: '20',
        material: 'C & D',
        instructions: 'wo1',
        action: 'FINAL',
        location1: { lat: '', lon: '' },
        scheduledDate: new Date(),
      }),
    );
    const wo2 = await body(
      api.createWorkorder().send({
        size: '20',
        material: 'C & D',
        instructions: 'wo2',
        action: 'GENERAL PURPOSE',
        location1: { lat: '', lon: '' },
        scheduledDate: new Date(),
      }),
    );

    const result = await body(
      request()
        .send([
          { id: wo1.id, deleted: 1, action: 'GENERAL PURPOSE' },
          { id: wo2.id, instructions: 'updated wo2' },
          {
            instructions: 'third work order',
            size: '20',
            material: 'C & D',
            action: 'FINAL',
            location1: { lat: '', lon: '' },
            scheduledDate: new Date(),
          },
        ])
        .expect(202),
    );
    assert.equal(result[1].size, null);
    assert.equal(result[1].material, null);
    assert.equal(result[1].action, 'GENERAL PURPOSE');
  },
  'API-189 - update workorders from GP to GP with size and material': async (
    request,
    api,
  ) => {
    const wo1 = await body(
      api.createWorkorder().send({
        size: '20',
        material: 'C & D',
        instructions: 'wo1',
        action: 'FINAL',
        location1: { lat: '', lon: '' },
        scheduledDate: new Date(),
      }),
    );
    const wo2 = await body(
      api.createWorkorder().send({
        size: '20',
        material: 'C & D',
        instructions: 'wo2',
        action: 'GENERAL PURPOSE',
        location1: { lat: '', lon: '' },
        scheduledDate: new Date(),
      }),
    );
    const result = await body(
      request()
        .send([
          {
            id: wo1.id,
            deleted: 1,
            action: 'GENERAL PURPOSE',
            size: '20',
            material: 'C & D',
          },
          { id: wo2.id, instructions: 'updated wo2' },
          {
            instructions: 'third work order',
            size: '20',
            material: 'C & D',
            action: 'FINAL',
            location1: { lat: '', lon: '' },
            scheduledDate: new Date(),
          },
        ])
        .expect(202),
    );
    assert.equal(result[1].size, null);
    assert.equal(result[1].material, null);
    assert.equal(result[1].action, 'GENERAL PURPOSE');
  },
  [`API-189 test validation, bulk create, incorrect action`]: async (
    request,
    api,
  ) => {
    const wo1 = {
      size: '20',
      action: 'FINAL',
      material: 'C & D',
      driverId: 1,
      location1: { lat: '', lon: '' },
      scheduledDate: new Date(),
      instructions: 'test order shoud not be created',
    };
    const wo2 = {
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
      wo2,
    );
    const { body: error } = await request()
      .send([wo1, wo2])
      .expect(400);
    const findWo1 = await body(
      api.listWorkorders().query({
        search: 'test order shoud not be created',
      }),
    );
    assert.equal(error.message, expectedError);
    assert.equal(findWo1.length, 0);
  },
};
