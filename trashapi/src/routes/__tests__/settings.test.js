import request from 'supertest';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';

jest.setTimeout(30000);

describe('ROUTE /v1/settings', () => {
  describe('++GET /v1/settings', () => {
    it('should return status 200', async () => {
      await request(app)
        .get('/v1/settings')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(200);
    });

    it('should return 401 without an authorization header', async () => {
      await request(app).get('/v1/settings').expect(401);
    });
  });
  describe('++GET /v1/settings?keys=map', () => {
    it('should return the map info', async () => {
      await request(app)
        .get('/v1/settings?keys=map')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].key).toEqual('map');
          expect(res.body[0].value.zoom).toEqual('10');
        })
        .expect(200);
    });
  });
  describe('++GET /v1/settings?keys=driver.dispatcherPhone', () => {
    it('should return the dispatcher phone info', async () => {
      await request(app)
        .get('/v1/settings?keys=driver.dispatcherPhone')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].key).toEqual('driver.dispatcherPhone');
        })
        .expect(200);
    });
  });
});
