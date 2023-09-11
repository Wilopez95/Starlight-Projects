/* eslint-disable no-unused-vars */
import assert from 'assert';
import request from 'supertest';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import {
  CAN,
  CAN_ACTION,
  CAN_SIZE,
  LOCATION_TYPE,
  LOCATION_WAYPOINT_TYPE,
  LOCATION,
  WORKORDER_MATERIAL,
} from '../../__fixtures__/constants.js';

jest.setTimeout(30000);

describe('GET /v1/constants', () => {
  it('should return status 200', async () => {
    await request(app)
      .get('/v1/constants')
      .set('Authorization', `Bearer ${admin5280Token}`)
      .expect(200);
  });

  it('should return 401 without an authorization header', async () => {
    await request(app).get('/v1/constants').expect(401);
  });

  it('should contain information on the driver app', async () => {
    await request(app)
      .get('/v1/constants')
      .set('Authorization', `Bearer ${admin5280Token}`)
      .expect(res => {
        assert(res.body.driverApp === typeof object);
        res.body.driverApp.name = 'com.starlightpro.driver';
      })
      .expect(200);
  });
  it('should contain information on cans', async () => {
    await request(app)
      .get('/v1/constants')
      .set('Authorization', `Bearer ${admin5280Token}`)
      .expect(res => {
        assert(res.body.can === typeof object);
        res.body.can = CAN;
        res.body.can.action = CAN_ACTION;
        res.body.can.size = CAN_SIZE;
      })
      .expect(200);
  });
  it('should contain information on locations', async () => {
    await request(app)
      .get('/v1/constants')
      .set('Authorization', `Bearer ${admin5280Token}`)
      .expect(res => {
        assert(res.body.can === typeof object);
        res.body.location = LOCATION;
        res.body.location.type = LOCATION_TYPE;
        res.body.location.waypointType = LOCATION_WAYPOINT_TYPE;
      })
      .expect(200);
  });
  it('should contain workorder material', async () => {
    await request(app)
      .get('/v1/constants')
      .set('Authorization', `Bearer ${admin5280Token}`)
      .expect(res => {
        assert(Array.isArray(res.body.workOrder.material));
        res.body.workOrder.material = WORKORDER_MATERIAL;
      })
      .expect(200);
  });
});
