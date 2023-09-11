import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';

import { initSubscriptionDates } from '../subscriptions/utils/initSubscriptionDates.js';
// pre-pricing service code:
// import { getServiceAndLineItemHistoricalIds } from '../subscriptions/getServiceAndLineItemHistoricalIds.js';
import { proceedSubscriptionServiceItems } from './proceedSubscriptionServiceItems.js';

export const proccedWorkOrdersTemplate = async (
  ctx,
  {
    serviceItems,
    subscription,
    skipQuerying = true,
    skipInsertServiceItems = true,
    skipOneTime = false,
  },
  trx,
) => {
  const subsServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);

  const { today, tomorrow, subscriptionEndDate } = initSubscriptionDates(subscription);
  // ToDo: Modify this endpoint to take information from the pricing backend
  // By: Esteban Navarro | Ticket: PS-231 | Date: 01/10/2022
  // Done
  const serviceItemsInput = serviceItems.map(item => {
    if (!skipQuerying) {
      const { serviceFrequency, material, billableService, ...serviceItemMapped } = item;
      return { ...serviceItemMapped };
    }
    return item;
  });

  const { subscriptionBillableServicesMap, oneTimeBillableServicesMap } =
    await subsServiceItemRepo.collectSubscriptionBillableServices(serviceItemsInput);
  // pre-pricing service code:
  // const { subscriptionBillableServicesMap, oneTimeBillableServicesMap } =
  //   await subsServiceItemRepo.collectSubscriptionBillableServices(serviceItemsInput);

  const { subscriptionRecurringOrdersTemplates, subscriptionOneTimeWorkOrdersTemplates } =
    await proceedSubscriptionServiceItems(
      ctx,
      {
        serviceItemsInput,
        subscription,
        firstOrderDate: today,
        subscriptionEndDate,
        today,
        tomorrow,
        subscriptionBillableServicesMap,
        oneTimeBillableServicesMap,
        skipInsertServiceItems,
        skipOneTime,
      },
      trx,
    );

  return { subscriptionRecurringOrdersTemplates, subscriptionOneTimeWorkOrdersTemplates };
};
