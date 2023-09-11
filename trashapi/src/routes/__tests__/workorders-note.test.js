import request from 'supertest';
import app from '../../app.js';
import { admin5280Token } from '../../__fixtures__/tokens.js';
import { generateWorkOrder } from '../../__fixtures__/workorder.js';
import constants from '../../utils/constants.js';

const {
  workOrder: {
    note: {
      type: { MANIFEST },
    },
  },
} = constants;

jest.setTimeout(30000);

const location1 = {
  name: 'SEARCH-location-one',
  type: '187',
};

describe('ROUTE /v1/workorders/:id /v1/workorders/note', () => {
  describe('++POST /v1/workorders/:id', () => {
    it('should create a workorder note', async () => {
      const wo = await request(app)
        .post('/v1/workorders')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(
          generateWorkOrder({
            location1,
            size: 10,
            material: 'Asphalt',
            driverId: 1,
          }),
        );

      const note = {
        type: MANIFEST,
        note: {
          quantity: 30.245,
        },
      };

      expect.assertions(1);
      const { body: woNote } = await request(app)
        .post(`/v1/workorders/${wo.body.id}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${admin5280Token}`)
        .send(note);

      expect(woNote.workOrderId).toEqual(wo.body.id);
    });
  });
});
