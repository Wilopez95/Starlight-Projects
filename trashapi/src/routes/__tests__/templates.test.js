/* eslint-disable no-unused-vars */
import assert from 'assert';
import request from 'supertest';
import isEqual from 'lodash/isEqual.js';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import { NEW_SIZE } from '../../__fixtures__/size.js';
import { generateWorkOrder } from '../../__fixtures__/workorder.js';
import constants from '../../utils/constants.js';

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

jest.setTimeout(30000);

const sortByName = (a, b) => a.name > b.name;
const compareArrays = (arr1, arr2) => isEqual(arr1, arr2);
const allSizes = [];

describe('ROUTE /v1/templates', () => {
  // beforeAll(() => {
  //   return request(app)
  //     .post('/v1/templates')
  //     .set('Authorization', `Bearer ${admin5280Token}`)
  //     .send({
  //       workOrderId: 2,
  //       name: 'Test',
  //       content: 'Test',
  //       contentRaw: JSON.stringify('<strong>Test</strong>'),
  //       logo: 'https://starlight-asset.s3.amazonaws.com/logo.png',
  //     })
  //     .then(cb => cb)
  //     .catch(err => console.log(err));
  // });
  describe('++GET /v1/templates', () => {
    it('should return status 200', () =>
      request(app)
        .get('/v1/templates')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .expect(res => {
          expect(res.status).toBe(200);
          expect(res.body).toBeDefined();
        }));
  });
  // describe('++GET /v1/templates/:templateId', () => {
  //   it('should return status 200', () => {
  //     return request(app)
  //       .get('/v1/templates/1')
  //       .set('Authorization', `Bearer ${admin5280Token}`)
  //       .expect(res => {
  //         expect(res.status).toBe(200);
  //         expect(res.body.name).toBe('Test');
  //       });
  //   });
  // });
  // describe('++POST /v1/templates', () => {
  //   it('should return status 200', async () => {
  //     const orderToCreate = generateWorkOrder({
  //       action: actions.SPOT,
  //       status: statuses.UNASSIGNED,
  //       cow: true,
  //       sos: true,
  //       signatureRequired: 1,
  //     });
  //     const resp = await request(app)
  //       .post('/v1/workorders')
  //       .set('Content-Type', 'application/json')
  //       .set('Authorization', `Bearer ${admin5280Token}`)
  //       .send({ ...orderToCreate, location1 });

  //     // console.log(resp.body);
  //     return request(app)
  //       .post('/v1/templates')
  //       .set('Authorization', `Bearer ${admin5280Token}`)
  //       .send({
  //         workOrderId: resp.body.id,
  //         name: 'Testing',
  //         content: 'Test',
  //         contentRaw: JSON.stringify('<strong>Test</strong>'),
  //         logo: 'https://starlight-asset.s3.amazonaws.com/logo.png',
  //       })
  //       .expect(res => {
  //         console.log(res.body);
  //         expect(res.status).toBe(201);
  //       });
  //   });
  // });
});
