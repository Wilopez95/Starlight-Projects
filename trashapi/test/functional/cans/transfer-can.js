import cans from '../../../src/tables/cans';
import constants from '../../../src/utils/constants';
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
    action: { TRANSFER },
  },
} = constants;

export const before = beforeTransaction(TRUCK, LOCATION);

export const after = afterTransaction;

export default {
  success: successTransaction(TRANSFER, TRUCK),
  notFound: notFound(cans, 'canId', 'id'),
  invalid: pipeline(invalid('canId'), invalidTransaction(LOCATION)),
};
