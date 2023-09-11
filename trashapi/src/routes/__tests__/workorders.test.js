/* eslint-disable no-unused-vars */
import request from 'supertest';
import app from '../../app.js';
import { generateDriver } from '../../__fixtures__/driver.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import { generateWorkOrder } from '../../__fixtures__/workorder.js';

jest.setTimeout(30000);

describe('ROUTE /v1/workorders', () => {
  describe('++GET /v1/workorders', () => {
    it('should return status 200', async () => {
      await request(app)
        .get('/v1/workorders')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(200);
    });

    it('should return 401 without an authorization header', async () => {
      await request(app).get('/v1/workorders').expect(401);
    });
  });
});
