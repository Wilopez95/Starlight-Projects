import groupBy from 'lodash/groupBy.js';

import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';

export const groupByServiceItem = async (workOrders, { state }) => {
  for (const workOrder of workOrders) {
    // ToDo: Modify this endpoint to take information from the pricing backend, to obtain subscriptions orders by id
    // By: Esteban Navarro || Ticket: PS-230
    // Done
    const subscriptionOrder = await SubscriptionOrderRepo.getInstance(state).getById({
      id: workOrder.subscriptionOrderId,
    });
    workOrder.subscriptionServiceItemId = subscriptionOrder.subscriptionServiceItemId;
    workOrder.preferredRoute = workOrder.assignedRoute;
    workOrder.thirdPartyHaulerId = subscriptionOrder.thirdPartyHaulerId;
    workOrder.thirdPartyHaulerDescription = subscriptionOrder.thirdPartyHaulerDescription;
  }

  const dataForSync = [];
  for (const [subscriptionServiceItemId, subscriptionWoGrouped] of Object.entries(
    groupBy(workOrders, 'subscriptionServiceItemId'),
  )) {
    const serviceItemDetails = await SubscriptionServiceItemRepo.getInstance(
      state,
    ).getDetailsForRoutePlanner({
      serviceItemId: subscriptionServiceItemId,
    });

    for (const [thirdPartyHaulerId, subscriptionWorkOrders] of Object.entries(
      groupBy(subscriptionWoGrouped, 'thirdPartyHaulerId'),
    )) {
      const [workOrder] = subscriptionWorkOrders;

      dataForSync.push({
        subscriptionWorkOrders,
        subscriptionWorkOrderDetails: {
          ...serviceItemDetails,
          thirdPartyHaulerId: Number(thirdPartyHaulerId),
          thirdPartyHaulerDescription: workOrder.thirdPartyHaulerDescription,
        },
      });
    }
  }

  return dataForSync;
};
