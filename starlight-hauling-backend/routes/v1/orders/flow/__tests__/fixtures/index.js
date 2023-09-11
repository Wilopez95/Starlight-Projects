import * as cancelOrderFixtures from './cancelOrder.js';
import * as completeOrderFixtures from './completeOrder.js';
import * as approveOrderFixtures from './approveOrder.js';
import * as finalizeOrderFixtures from './finalizeOrder.js';
import * as unApproveOrderFixtures from './unApproveOrder.js';
import * as unFinalizeOrderFixtures from './unFinalizeOrder.js';

export default {
  ...cancelOrderFixtures,
  ...completeOrderFixtures,
  ...approveOrderFixtures,
  ...finalizeOrderFixtures,
  ...unApproveOrderFixtures,
  ...unFinalizeOrderFixtures,
};
