import assert from 'assert';
import request from 'supertest';
import isEqual from 'lodash/isEqual.js';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import { NEW_SIZE } from '../../__fixtures__/size.js';

jest.setTimeout(30000);

const sortByName = (a, b) => a.name > b.name;
const compareArrays = (arr1, arr2) => isEqual(arr1, arr2);
const allSizes = [];

describe('ROUTE /v1/sizes', () => {
  describe('++GET /v1/sizes', () => {
    it('should return status 200', async () => {
      await request(app)
        .get('/v1/sizes')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        })
        .expect(200);
    });

    it('should return 401 without an authorization header', async () => {
      await request(app).get('/v1/sizes').expect(401);
    });
  });
  describe('++GET /v1/sizes?id=', () => {
    it('should return status 200', async () => {
      await request(app)
        .get('/v1/sizes?id=1')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].name).toEqual('10');
          expect(res.body[0].id).toEqual(1);
        })
        .expect(200);
    });
  });
  describe('++GET /v1/sizes?sort=', () => {
    it('should sort sizes by name', async () => {
      await request(app)
        .get('/v1/sizes?sort=name')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          assert(!compareArrays(allSizes, res.body));
          assert(compareArrays(allSizes.sort(sortByName), res.body));
        })
        .expect(200);
    });
  });
  describe('++POST /v1/sizes', () => {
    it('should not create a new size without authorization', async () => {
      await request(app)
        .post('/v1/sizes')
        .set('Content-Type', 'application/json')
        .send(NEW_SIZE)
        .expect(401);
    });
    it('should create a new size', async () => {
      await request(app)
        .post('/v1/sizes')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(NEW_SIZE)
        .expect(res => {
          expect(res.body.deleted).toEqual(0);
        })
        .expect(201);
    });
  });
  describe('++PUT /v1/sizes/:id', () => {
    it('should not update the name of the size without authorization', async () => {
      await request(app)
        .put('/v1/sizes')
        .set('Content-Type', 'application/json')
        .send(NEW_SIZE)
        .expect(401);
    });
    it('should update the name of the size', async () => {
      await request(app)
        .put('/v1/sizes/4')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ name: '101' })
        .expect(202);
    });
    it('should not allow a blank name when updating a size', async () => {
      await request(app)
        .put('/v1/sizes/4')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ name: null })
        .expect(400);
    });
    it('should not update size name to a pre-existing size name', async () => {
      await request(app)
        .put('/v1/sizes/2')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ name: '20' })
        .expect(400);
    });
    it('should not update name of a non-existing size', async () => {
      await request(app)
        .put('/v1/sizes/0')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ name: '20' })
        .expect(404);
    });
  });
  describe('++DELETE /v1/sizes/:id', () => {
    it('should not delete the size without authorization', async () => {
      await request(app).delete('/v1/sizes/6').set('Content-Type', 'application/json').expect(401);
    });
    it('should delete the size', async () => {
      await request(app)
        .delete('/v1/sizes/6')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(204);
    });
    it('should set the deleted flag to 0 if a user recreates a deleted size', async () => {
      await request(app)
        .post('/v1/sizes')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({ name: '40CT' })
        .expect(res => {
          expect(res.body.id).toEqual(6);
          expect(res.body.deleted).toEqual(0);
        })
        .expect(201);
    });
  });
});
