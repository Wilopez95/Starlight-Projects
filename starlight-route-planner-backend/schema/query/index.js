import * as haulingRoutes from './hauling/index.js';
import * as billingRoutes from './billing/index.js';
import * as trashapiRoutes from './trashapi/index.js';

import * as masterRoutes from './masterRoute/index.js';
import * as workOrders from './workOrder/index.js';
import * as dailyRoutes from './dailyRoute/index.js';
import * as serviceItems from './serviceItems/index.js';
import * as weightTickets from './weightTicket/index.js';

export default {
  ...haulingRoutes,
  ...billingRoutes,
  ...trashapiRoutes,

  ...masterRoutes,
  ...workOrders,
  ...dailyRoutes,
  ...serviceItems,
  ...weightTickets,
};
