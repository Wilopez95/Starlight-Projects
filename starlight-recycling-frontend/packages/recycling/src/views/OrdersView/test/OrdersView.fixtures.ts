import faker from 'faker';
import { times } from 'lodash/fp';
import { OrderStatus, OrderType } from '../../../graphql/api';

const weightIn = faker.datatype.number(100);
const weightOut = faker.datatype.number({ min: 100, max: 200 });
const TOTAL_ORDER_COUNT = 10;

const createOrder = () => ({
  id: 1,
  status: OrderStatus.InYard,
  createdAt: new Date(),
  WONumber: faker.random.alphaNumeric(10),
  type: OrderType.Dump,
  weightIn,
  weightOut,
  customer: {
    id: 1,
    businessName: faker.name.findName(),
    __typename: 'Customer',
  },
  material: {
    id: 1,
    description: faker.commerce.productMaterial(),
    __typename: 'Material',
  },
  netWeight: weightIn - weightOut,
  graded: false,
  __typename: 'OrderIndexed',
});

export const fixtures = {
  data: {
    indexedOrdersGroupByStatusTotal: {
      all: TOTAL_ORDER_COUNT,
      IN_YARD: 1,
      ON_THE_WAY: 0,
      LOAD: 0,
      PAYMENT: 0,
      WEIGHT_OUT: 0,
      COMPLETED: 0,
      APPROVED: 0,
      FINALIZED: 0,
      INVOICED: 0,
      __typename: 'OrderTotalByStatus',
    },
    ordersIndexed: {
      data: times(createOrder, TOTAL_ORDER_COUNT),
      total: TOTAL_ORDER_COUNT,
      __typename: 'OrdersIndexedResponse',
    },
  },
};
