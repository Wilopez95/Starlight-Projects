import request from 'supertest';
import app from '../../app.js';
import { generateDriver } from '../../__fixtures__/driver.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import { generateWorkOrder } from '../../__fixtures__/workorder.js';
import constants from '../../utils/constants.js';
import {
  objectError,
  nullError,
  inArrayErrorMessage,
  buildReadableError,
} from '../../utils/validators.js';

jest.setTimeout(30000);

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

const location1 = {
  name: 'SEARCH-location-one',
  type: '187',
};

describe('ROUTE /v1/workorders', () => {
  describe('++POST /v1/workorders', () => {
    it('should create an "unassigned" workorder', () => {
      const orderToCreate = generateWorkOrder({
        action: actions.SPOT,
        status: statuses.UNASSIGNED,
        cow: true,
        sos: true,
      });
      return request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ ...orderToCreate, location1 })
        .expect(res => {
          expect(res.body.status).toEqual('UNASSIGNED');
          expect(res.body.action).toEqual('SPOT');
          expect(res.body.cow).toEqual(1);
          expect(res.body.sos).toEqual(1);
        })
        .expect(201);
    });
    it(`should create a transition step REASSIGNMENT on work order creation,
      when driverId passed and status is ASSIGNED`, async () => {
      const driver = await request(app)
        .post('/v1/drivers')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(generateDriver());

      const wo = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({
          ...generateWorkOrder({
            action: actions.SPOT,
            status: statuses.ASSIGNED,
            driverId: driver.body.id,
          }),
          location1,
        });

      const step = await request(app)
        .get(`/v1/workorders/${wo.body.id}/transition`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`);

      expect(step.body.type).toEqual(TRANSITION);
      expect(step.body.note.newState).toEqual(REASSIGNMENT);
    });
    it('should create a workorder with the material set as asphalt [API-193]', () => {
      const orderToCreate = generateWorkOrder({
        size: '40',
        action: actions.SPOT,
        status: statuses.UNASSIGNED,
        material: 'Asphalt',
      });
      return request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ ...orderToCreate, location1 })
        .expect(res => {
          expect(res.body.status).toEqual('UNASSIGNED');
          expect(res.body.action).toEqual('SPOT');
          expect(res.body.material).toEqual('Asphalt');
        })
        .expect(201);
    });
    it('should create a workorder with the action set as "GENERAL PURPOSE" [API-181]', () => {
      const orderToCreate = generateWorkOrder({
        status: statuses.ASSIGNED,
        action: actions.GENERAL_PURPOSE,
        location1,
        size: '10',
        material: 'Asphalt',
        driverId: 1,
      });
      return request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(orderToCreate)
        .expect(res => {
          expect(res.body.action).toEqual('GENERAL PURPOSE');
        })
        .expect(201);
    });
    it('should create a workorder with the text on way field [API-175]', () => {
      const textOnWay = 'textOnWay';
      const orderToCreate = generateWorkOrder({
        status: statuses.ASSIGNED,
        action: actions.GENERAL_PURPOSE,
        location1,
        size: '10',
        material: 'Asphalt',
        driverId: 1,
        textOnWay,
      });
      return request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(orderToCreate)
        .expect(res => {
          expect(res.body.textOnWay).toEqual(textOnWay);
        })
        .expect(201);
    });
    it('should create a workorder with the permitNumber field [API-216]', () => {
      const permitNumber = '111QQQ';
      const orderToCreate = generateWorkOrder({
        status: statuses.ASSIGNED,
        action: actions.GENERAL_PURPOSE,
        location1,
        size: '10',
        driverId: 1,
        permittedCan: false,
        permitNumber,
      });
      return request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(orderToCreate)
        .expect(res => {
          expect(res.body.permitNumber).toEqual(permitNumber);
          expect(res.body.permittedCan).toEqual(1);
        })
        .expect(201);
    });
    it('should create a workorder with permittedCan set to true [API-216]', () => {
      const orderToCreate = generateWorkOrder({
        status: statuses.ASSIGNED,
        action: actions.GENERAL_PURPOSE,
        location1,
        size: '10',
        driverId: 1,
        permittedCan: true,
      });
      return request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(orderToCreate)
        .expect(res => {
          expect(res.body.permittedCan).toEqual(1);
        })
        .expect(201);
    });
    it('should create a workorder with permittedCan set to false [API-216]', () => {
      const orderToCreate = generateWorkOrder({
        status: statuses.ASSIGNED,
        action: actions.GENERAL_PURPOSE,
        location1,
        size: '10',
        permitNumber: '',
        driverId: 1,
        permittedCan: false,
      });
      return request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(orderToCreate)
        .expect(res => {
          expect(res.body.permittedCan).toEqual(0);
        })
        .expect(201);
    });
    it('should create a workorder using materials associated from database [API-235]', async () => {
      const { body: material } = await request(app)
        .post('/v1/materials')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ name: 'wood' });
      const orderToCreate = generateWorkOrder({
        status: statuses.ASSIGNED,
        action: actions.FINAL,
        material: material.name,
        location1,
        permitNumber: '',
        permittedCan: false,
        driverId: 1,
      });
      await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(orderToCreate)
        .expect(res => {
          expect(res.body.material).toEqual('wood');
        })
        .expect(201);
    });
    it('should create a workorder using sizes associated from database [API-235]', async () => {
      const { body: size } = await request(app)
        .post('/v1/sizes')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ name: '44' });
      const orderToCreate = generateWorkOrder({
        status: statuses.ASSIGNED,
        action: actions.FINAL,
        size: size.name,
        location1,
        permitNumber: '',
        permittedCan: false,
        driverId: 1,
      });
      await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(orderToCreate)
        .expect(res => {
          expect(res.body.size).toEqual('44');
        })
        .expect(201);
    });
  });
  describe('create workorder validation', () => {
    it('should return an error if size is null [API-189]', async () => {
      const workOrder = {
        size: null,
        material: 'C & D',
        action: 'FINAL',
        driverId: 1,
        location1: { lat: '', lon: '' },
        scheduledDate: '2018-02-03',
        haulingSync: false,
      };
      const expectedError = buildReadableError(nullError, 'size', 'null', workOrder);
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);
      expect(body.message).toEqual(expectedError);
    });
    it('should return an error if material is null [API-189]', async () => {
      const workOrder = {
        size: '20',
        material: null,
        action: 'FINAL',
        driverId: 1,
        location1: { lat: '', lon: '' },
        scheduledDate: '2018-02-03',
        haulingSync: false,
      };
      const expectedError = buildReadableError(nullError, 'material', null, workOrder);
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);

      expect(body.message).toEqual(expectedError);
    });
    it('should return an error if an incorrect material is sent [API-189]', async () => {
      const workOrder = {
        size: '20',
        material: 'WWW',
        action: 'FINAL',
        driverId: 1,
        location1: { lat: '', lon: '' },
        scheduledDate: '2018-02-03',
        haulingSync: false,
      };
      const expectedError = buildReadableError(inArrayErrorMessage, 'material', 'WWW', workOrder);
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);

      expect(body.message).toEqual(expectedError);
    });
    it('should return an error if an empty obj for location1 is sent [API-189]', async () => {
      const workOrder = {
        size: '20',
        action: 'FINAL',
        material: 'C & D',
        driverId: 1,
        location1: {},
        scheduledDate: '2018-02-03',
        haulingSync: false,
      };
      const expectedError = buildReadableError(
        objectError,
        'location1',
        workOrder.location1,
        workOrder,
      );
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);

      expect(body.message).toEqual(expectedError);
    });
    it('should return an error if a null location1 is sent [API-189]', async () => {
      const workOrder = {
        size: '20',
        action: 'FINAL',
        material: 'C & D',
        driverId: 1,
        scheduledDate: '2018-02-03',
        haulingSync: false,
      };
      const expectedError = buildReadableError(nullError, 'location1', 'undefined', workOrder);
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);

      expect(body.message).toEqual(expectedError);
    });
    it('should return an error if a null scheduledDate is sent [API-189]', async () => {
      const workOrder = {
        size: '20',
        action: 'FINAL',
        material: 'C & D',
        driverId: 1,
        location1: { lat: '', lon: '' },
        scheduledDate: null,
        haulingSync: false,
      };
      const expectedError = buildReadableError(nullError, 'scheduledDate', 'null', workOrder);
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);

      expect(body.message).toEqual(expectedError);
    });
    it('should return an error if a null action is sent [API-189]', async () => {
      const workOrder = {
        size: '20',
        action: null,
        material: 'C & D',
        driverId: 1,
        location1: { lat: '', lon: '' },
        scheduledDate: '2018-02-03',
        haulingSync: false,
      };
      const expectedError = buildReadableError(nullError, 'action', 'null', workOrder);
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);

      expect(body.message).toEqual(expectedError);
    });
    it('should return an error if an incorrect action is sent [API-189]', async () => {
      const workOrder = {
        size: '20',
        action: 'WWW',
        material: 'C & D',
        driverId: 1,
        location1: { lat: '', lon: '' },
        scheduledDate: '2018-02-03',
        haulingSync: false,
      };
      const expectedError = buildReadableError(inArrayErrorMessage, 'action', 'WWW', workOrder);
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);

      expect(body.message).toEqual(expectedError);
    });
    it('should return an error if location2 should be on RELOCATE action [API-189]', async () => {
      const workOrder = {
        status: statuses.UNASSIGNED,
        action: actions.RELOCATE,
        location1,
        size: '20',
        material: 'C & D',
        scheduledDate: '2018-02-03',
        haulingSync: false,
      };
      const expectedError = buildReadableError(nullError, 'location2', 'undefined', workOrder);
      const { body } = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(workOrder)
        .expect(400);

      expect(body.message).toEqual(expectedError);
    });
  });
});
