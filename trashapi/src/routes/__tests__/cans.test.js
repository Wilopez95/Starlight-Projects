/* eslint-disable no-unused-vars */
import assert from 'assert';
import request from 'supertest';
import app from '../../app.js';
import transactions from '../../tables/transactions.js';
import cans from '../../tables/cans.js';
import constants from '../../utils/constants.js';
import { one, my } from '../../utils/query.js';
import { generateLocation } from '../../__fixtures__/location.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import {
  BASIC_CAN,
  MAINT_CAN,
  OOS_CAN,
  HAZMAT_CAN,
  LOCATION_CAN,
  generateCan,
} from '../../__fixtures__/can.js';

const {
  location: {
    type: { LOCATION, TRUCK, WAYPOINT },
  },
  can: {
    action: { MOVE, NOTE },
  },
} = constants;

const TEST_NOTE = {
  text: 'some text',
  pictures: [
    // this is just a 1px transparent gif
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///////' + 'yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  ],
};

jest.setTimeout(30000);
describe('ROUTE /v1/cans', () => {
  describe('++GET /v1/cans', () => {
    it('should return status 200', async () => {
      await request(app)
        .get('/v1/cans')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(200);
    });
    it('should return an array of cans', async () => {
      await request(app)
        .get('/v1/cans')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          assert(Array.isArray(res.body));
        })
        .expect(200);
    });
    it('should return 401 without an authorization header', async () => {
      await request(app).get('/v1/cans').expect(401);
    });
  });

  describe('++POST /v1/cans', () => {
    it('should create a new can and return status 201', async () => {
      await request(app)
        .post('/v1/cans')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(BASIC_CAN)
        .expect(res => {
          expect(res.body.size).toEqual('10');
          expect(res.body.transactions[0].action).toEqual('CREATE');
        })
        .expect(201);
    });
    it('should create a new can which requires maintenance', async () => {
      await request(app)
        .post('/v1/cans')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(MAINT_CAN)
        .expect(res => {
          expect(res.body.requiresMaintenance).toEqual(1);
        })
        .expect(201);
    });
    it('should create a new can which is out of service', async () => {
      await request(app)
        .post('/v1/cans')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(OOS_CAN)
        .expect(res => {
          expect(res.body.outOfService).toEqual(1);
        })
        .expect(201);
    });
    it('should create a new can which is hazmat', async () => {
      await request(app)
        .post('/v1/cans')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(HAZMAT_CAN)
        .expect(res => {
          expect(res.body.hazardous).toEqual(1);
        })
        .expect(201);
    });
    it('should create a new can which has a location', async () => {
      await request(app)
        .post('/v1/cans')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(LOCATION_CAN)
        .expect(res => {
          expect(res.body.location.id).toEqual(2);
          expect(res.body.location.waypointType).toEqual('HOME_YARD');
          expect(res.body.transactions[0].location2.id).toEqual(2);
        })
        .expect(201);
    });
  });
  describe('++POST /v1/cans/:id/note', () => {
    it('should create a new can note and return status 204', async done => {
      try {
        await request(app)
          .post('/v1/cans/1/note')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${admin5280Token}`)
          .send(TEST_NOTE)
          // .expect(res => {
          //   expect(res.body.size).toEqual('10');
          //   expect(res.body.transactions[0].action).toEqual('CREATE');
          // })
          .expect(204);
        done();
      } catch (err) {
        done(err);
      }
    });
    it('should return status 404 if the can does not exist', () =>
      request(app)
        .post('/v1/cans/00/note')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(TEST_NOTE)
        .expect(res => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('The requested resource could not be found');
        }));
  });
  describe('++GET /v1/cans/:id', () => {
    it('should return a can', async done => {
      try {
        await request(app)
          .get('/v1/cans/2')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${admin5280Token}`)
          .expect(res => {
            expect(res.body.size).toBeDefined();
            // expect(res.body.transactions[0].action).toEqual('CREATE');
          })
          .expect(200);
        done();
      } catch (err) {
        done(err);
      }
    });
    it('should return a can and transactions', async done => {
      try {
        await request(app)
          .get('/v1/cans/2?withTransactions=1')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${admin5280Token}`)
          .expect(res => {
            expect(res.body.size).toBeDefined();
            expect(res.body.transactions[0].action).toBeDefined();
          })
          .expect(200);
        done();
      } catch (err) {
        done(err);
      }
    });
    it('should return status 404 if the can does not exist', () =>
      request(app)
        .post('/v1/cans/00/note')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(TEST_NOTE)
        .expect(res => {
          expect(res.status).toEqual(404);
          expect(res.body.message).toEqual('The requested resource could not be found');
        }));
  });
});
