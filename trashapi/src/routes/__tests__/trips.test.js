/* eslint-disable no-unused-vars */
import assert from 'assert';
import request from 'supertest';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';

jest.setTimeout(30000);

describe('ROUTE /v1/trips', () => {
  describe('GET /v1/trips', () => {
    it('should return status 200', async () => {
      await request(app)
        .get('/v1/trips')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(200);
    });

    it('should return 401 without an authorization header', async () => {
      await request(app).get('/v1/trips').expect(401);
    });
  });
});
