/* eslint-disable no-unused-vars */
import assert from 'assert';
import request from 'supertest';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import { DRIVER, DRIVER_NO_TRUCK, DRIVER_LOCATION_TYPE } from '../../__fixtures__/driver.js';

jest.setTimeout(30000);

describe('ROUTE /v1/drivers', () => {
  describe('++GET /v1/drivers', () => {
    it('should return status 200', async () => {
      await request(app)
        .get('/v1/drivers')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(200);
    });

    it('should return 401 without an authorization header', async () => {
      await request(app).get('/v1/drivers').expect(401);
    });
  });
  describe('++GET /v1/drivers/:username', () => {
    it('should return the driver by their "username"', async () => {
      await request(app)
        .get('/v1/drivers?username=steven.truesdell@starlightpro.com')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(200);
    });
  });
  describe('++POST /v1/drivers', () => {
    it('should create a new driver', async () => {
      await request(app)
        .post('/v1/drivers')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(DRIVER)
        .expect(res => {
          expect(res.body.id).toBeDefined();
        })
        .expect(201);
    });
    it('should create a new driver without a truck', async () => {
      await request(app)
        .post('/v1/drivers')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(DRIVER_NO_TRUCK)
        .expect(res => {
          expect(res.body.id).toBeDefined();
        })
        .expect(201);
    });
    it('should not create a new driver with an incorrect location type', async () => {
      await request(app)
        .post('/v1/drivers')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(DRIVER_LOCATION_TYPE)
        .expect(400);
    });
    it('should return 401 without an authorization header', async () => {
      await request(app)
        .post('/v1/drivers')
        .set('Content-Type', 'application/json')
        .send(DRIVER)
        .expect(401);
    });
  });
});
