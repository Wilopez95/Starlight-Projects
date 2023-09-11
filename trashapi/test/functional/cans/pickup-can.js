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
    type: { LOCATION, TRUCK },
  },
  can: {
    action: { PICKUP },
  },
} = constants;

export const before = beforeTransaction(LOCATION, TRUCK);

export const after = afterTransaction;

export default {
  success: successTransaction(PICKUP, TRUCK),
  notFound: notFound(cans, 'canId', 'id'),
  'pickup-can from null location': async (request, api) => {
    const { body: can } = await api.createCan().send({
      ...mockCan({ name: 'wrong location' }),
      location: { name: 'from null location' },
    });
    await request({ canId: can.id })
      .send(mockLocation(TRUCK, false))
      .expect(204);
  },
  invalid: pipeline(invalid('canId'), invalidTransaction(LOCATION)),
};
