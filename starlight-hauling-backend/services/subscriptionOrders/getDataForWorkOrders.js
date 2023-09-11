import has from 'lodash/fp/has.js';
import pick from 'lodash/fp/pick.js';

import { subscriptionOrderFieldsForWosUpdate } from '../../consts/subscriptionOrders.js';

export const getDataForWorkOrders = ({ data, oldOrder }) => {
  const wosData = pick(subscriptionOrderFieldsForWosUpdate)(data);

  if (has('assignedRoute')(data) && data.assignedRoute !== oldOrder.assignedRoute) {
    wosData.assignedRoute = data.assignedRoute;
  }

  if (oldOrder.purchaseOrderId !== data.purchaseOrderId && data.workOrdersCount > 0) {
    wosData.purchaseOrderId = data.purchaseOrderId;
  }

  return wosData;
};
