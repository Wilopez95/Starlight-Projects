import request from 'supertest';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';

jest.setTimeout(30000);
describe('ROUTE /v1/materials', () => {
  describe('++GET /v1/materials', () => {
    it('should return status 200', async () => {
      await request(app)
        .get('/v1/materials')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(200);
    });

    it('should return 401 without an authorization header', async () => {
      await request(app).get('/v1/materials').expect(401);
    });
  });
  describe('++POST /v1/materials', () => {
    it('should create material [API-234]', async () => {
      await request(app)
        .post('/v1/materials')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({
          name: 'Steel',
        })
        .expect(res => {
          expect(res.body.name).toEqual('Steel');
        })
        .expect(201);
    });
    it('should not be able to create material without a name [API-234]', async () => {
      await request(app)
        .post('/v1/materials')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({})
        .expect(400);
    });
    it('should lookup for existing material [API-234]', async () => {
      const { body: alreadyCreated } = await request(app)
        .post('/v1/materials')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({
          name: 'Steel',
        });
      const { body: created } = await request(app)
        .post('/v1/materials')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({
          name: 'Steel',
        })
        .expect(201);
      expect(created.id).toEqual(alreadyCreated.id);
      expect(created.userId).toEqual(alreadyCreated.userId);
    });
    it('should return an error with invalid request on creating material [API-234]', async () => {
      await request(app)
        .post('/v1/materials')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send([])
        .expect(400);
    });
    it('should return an error with empty payload on creating material [API-234]', async () => {
      await request(app)
        .post('/v1/materials')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send({})
        .expect(400);
    });
  });
});
