import groupBy from 'lodash/groupBy.js';

import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';

import { camelCaseKeys } from '../../utils/dbHelpers.js';

import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses.js';
import { ACTION } from '../../consts/actions.js';
import { mapServiceItemsForRegeneration } from './utils/mapServiceItemsForRegeneration.js';
import { proccedWorkOrdersTemplate } from './proccedWorkOrdersTemplate.js';

export const regenerateWorkOrders = async (ctx, { updatedServiceItems }, trx) => {
  const subsOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);

  const groupedServiceItems = groupBy(updatedServiceItems, 'subscriptionId');

  const workOrdersTemplates = [];
  const deletedWorkOrders = [];

  for (const serviceItems of Object.values(groupedServiceItems)) {
    const [serviceItem] = serviceItems;

    const serviceItemToRegenerate = serviceItems.filter(item => item.needRegenerate);

    if (serviceItemToRegenerate.length) {
      const { deletedWorkOrders: workOrders } = await subsOrderRepo.cleanOrders(
        {
          subscriptionIds: [serviceItem.subscription.id],
          subscriptionServiceItemIds: serviceItemToRegenerate.map(item => item.id),
          statuses: [SUBSCRIPTION_ORDER_STATUS.scheduled],
          types: [ACTION.service],
        },
        trx,
      );

      if (deletedWorkOrders.length) {
        deletedWorkOrders.push(...workOrders);
      }

      const { subscriptionRecurringOrdersTemplates } = await proccedWorkOrdersTemplate(
        ctx,
        {
          subscription: camelCaseKeys(serviceItem.subscription),
          serviceItems: mapServiceItemsForRegeneration(serviceItemToRegenerate),
          skipQuerying: false,
          skipOneTime: true,
        },
        trx,
      );

      if (subscriptionRecurringOrdersTemplates.length) {
        workOrdersTemplates.push(...subscriptionRecurringOrdersTemplates);
      }
    }
  }

  return { deletedWorkOrders, workOrdersTemplates };
};
