import * as commonFixtures from './common.js';
import * as addOrdersFixtures from './addOrders.js';
import * as updateOrdersFixtures from './updateOrders.js';
import * as rescheduleOrderFixtures from './rescheduleOrder.js';

export default {
  ...commonFixtures,
  ...addOrdersFixtures,
  ...updateOrdersFixtures,
  ...rescheduleOrderFixtures,
};
