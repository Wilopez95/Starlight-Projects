import cans from '../../../src/tables/cans';
import constants from '../../../src/utils/constants';
import mockCan from '../../fixtures/can';
import mockLocation from '../../fixtures/location';
import {
  pipeline,
  notFound,
  invalid,
  invalidTransaction,
  successTransaction,
  beforeTransaction,
  afterTransaction,
} from '../common';

const {
  location: {
    type: { TRUCK },
  },
} = constants;

export const before = beforeTransaction('TRUCK', 'LOCATION');

export const after = afterTransaction;

export default {
  success: successTransaction('DROPOFF', 'LOCATION'),
  notFound: notFound(cans, 'canId', 'id'),
  'drop off can to null location': async (request, api) => {
    const { body: can } = await api.createCan().send({
      ...mockCan({ name: 'wrong location' }),
      location: mockLocation(TRUCK, false),
    });
    await request({ canId: can.id })
      .send({ name: 'to null location' })
      .expect(204);
  },
  invalid: pipeline(invalid('canId'), invalidTransaction('TRUCK')),
};
