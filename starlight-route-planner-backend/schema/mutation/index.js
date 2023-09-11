import * as haulingRoutes from './hauling/index.js';
import * as trashapiRoutes from './trashapi/index.js';

import * as masterRoutes from './masterRoute/index.js';
import * as dailyRoutes from './dailyRoute/index.js';
import * as workOrders from './workOrder/index.js';
import * as weightTickets from './weightTicket/index.js';

export default {
  ...haulingRoutes,
  ...trashapiRoutes,

  ...masterRoutes,
  ...dailyRoutes,
  ...workOrders,
  ...weightTickets,
};
