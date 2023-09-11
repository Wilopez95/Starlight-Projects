import request from 'supertest';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import {
  BASE_LOCATION,
  LOCATION_WAYPOINT,
  LOCATION_TRUCK,
  LOCATION_TRUCK_LOCATION,
  LOCATION_WAYPOINT_BAD,
} from '../../__fixtures__/location.js';

jest.setTimeout(30000);
describe('ROUTE /v1/locations', () => {
  describe('++GET /v1/locations', () => {
    it('should return status 200', () =>
      request(app)
        .get('/v1/locations')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(200));

    it('should return 401 without an authorization header', () =>
      request(app).get('/v1/locations').expect(401));
  });

  describe('++POST /v1/locations', () => {
    it('should create a new location', () =>
      request(app)
        .post('/v1/locations')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(BASE_LOCATION)
        .expect(res => {
          expect(res.body.type).toEqual('LOCATION');
          expect(res.body.waypointType).toBe(null);
        })
        .expect(201));

    it('should create a new location with a different name and same coordinates', () =>
      request(app)
        .post('/v1/locations')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(BASE_LOCATION)
        .expect(res => {
          expect(res.body.type).toEqual('LOCATION');
          expect(res.body.location.lon).toEqual(-80.12066639999999);
        })
        .expect(201));
    it('should not create a waypoint if waypointName is missing', () =>
      request(app)
        .post('/v1/locations')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(LOCATION_WAYPOINT_BAD)
        .expect(res => {
          expect(res.body.code).toEqual(400);
          expect(res.body.message).toEqual('waypointName is required');
        })
        .expect(400));
    it('should create a new waypoint', () =>
      request(app)
        .post('/v1/locations')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(LOCATION_WAYPOINT)
        .expect(res => {
          expect(res.body.type).toEqual('WAYPOINT');
          expect(res.body.waypointType).toEqual('HOME_YARD');
        })
        .expect(201));
    it('should create a new truck without a location', () =>
      request(app)
        .post('/v1/locations')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(LOCATION_TRUCK)
        .expect(res => {
          expect(res.body.type).toEqual('TRUCK');
          expect(res.body.waypointType).toBe(null);
        })
        .expect(201));
    it('should create a new truck with a location', () =>
      request(app)
        .post('/v1/locations')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(LOCATION_TRUCK_LOCATION)
        .expect(res => {
          expect(res.body.type).toEqual('TRUCK');
          expect(res.body.waypointType).toBe(null);
          expect(res.body.location.lon).toEqual(-80.12066639999999);
        })
        .expect(201));
  });
  describe('++GET /v1/locations?type=', () => {
    it('should return only "truck" locations', () =>
      request(app)
        .get('/v1/locations?type=TRUCK')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].type).toEqual('TRUCK');
        })
        .expect(200));
    it('should return only "waypoint" locations', () =>
      request(app)
        .get('/v1/locations?type=WAYPOINT')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].type).toEqual('WAYPOINT');
        })
        .expect(200));
    it('should return only "location" locations', () =>
      request(app)
        .get('/v1/locations?type=LOCATION')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].type).toEqual('LOCATION');
        })
        .expect(200));
  });
  describe('++GET /v1/locations?type=&name=', () => {
    it('should get a location by type and name', () =>
      request(app)
        .get('/v1/locations?type=LOCATION&name=5280+Home+Yard')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].type).toEqual('LOCATION');
        })
        .expect(200));
  });
});
