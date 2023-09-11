import knex from '../../db/connection.js';

import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { mapUpdateEvents } from '../../utils/updateEvents.js';
import { mathRound2 } from '../../utils/math.js';

export const recalculateSubscriptionSummary = async (
  ctx,
  { id, serviceItems: serviceItemsUpdates = [], lineItems: lineItemsUpdates = [] } = {},
  trx = knex,
) => {
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);

  const subscriptionOrders = [];
  let lineItems = [];

  const subscription = await subscriptionRepo.getByIdPopulated({ id }, trx);

  const {
    add: addServiceItems,
    edit: editServiceItems,
    remove: removeServiceItems,
  } = mapUpdateEvents(serviceItemsUpdates);

  const {
    add: addLineItems,
    edit: editLineItems,
    remove: removeLineItems,
  } = mapUpdateEvents(lineItemsUpdates);

  const serviceItems = subscription.serviceItems
    .map(serviceItem => {
      const toDelete = removeServiceItems.find(item => item.id === serviceItem.id);
      if (toDelete) {
        return null;
      }

      lineItems.push(...(serviceItem.lineItems || []));
      subscriptionOrders.push(...(serviceItem.subscriptionOrders || []));

      const serviceItemUpdate = editServiceItems.find(item => item.id === serviceItem.id);
      if (serviceItemUpdate) {
        return { ...serviceItem, ...serviceItemUpdate };
      }

      return serviceItem;
    })
    .filter(Boolean);

  lineItems = lineItems
    .map(lineItem => {
      const isDeleted = removeLineItems.find(item => item.id === lineItem.id);
      if (isDeleted) {
        return null;
      }

      const lineItemUpdate = editLineItems.find(item => item.id === lineItem.id);
      if (lineItemUpdate) {
        return { ...lineItem, ...lineItemUpdate };
      }

      return lineItem;
    })
    .filter(Boolean);

  lineItems.push(...addLineItems);
  addServiceItems.forEach(serviceItem => {
    lineItems.push(...(serviceItem.lineItems || []));
    subscriptionOrders.push(...(serviceItem.subscriptionOrders || []));
    serviceItems.push(serviceItem);
  });

  let billableLineItemsTotal = 0;
  let billableSubscriptionOrdersTotal = 0;
  let billableServicesTotal = 0;

  serviceItems.forEach(item => {
    billableServicesTotal += mathRound2(
      Number(item.nextPrice || item.price || 0) * Number(item.quantity || 1),
    );
  });
  lineItems.forEach(item => {
    billableLineItemsTotal += mathRound2(
      Number(item.nextPrice || item.price || 0) * Number(item.quantity || 1),
    );
  });
  subscriptionOrders.forEach(item => {
    billableSubscriptionOrdersTotal += mathRound2(
      Number(item.nextPrice || item.price || 0) * Number(item.quantity || 1),
    );
  });

  const taxesTotal = 0;
  // TODO: calculateTaxes, will be implemented in future, currently under BA

  const result = {
    billableServicesTotal,
    billableLineItemsTotal,
    billableSubscriptionOrdersTotal,
    currentSubscriptionPrice:
      billableServicesTotal + billableLineItemsTotal + billableSubscriptionOrdersTotal,
    total: billableServicesTotal + billableLineItemsTotal,
    grandTotal: billableServicesTotal + billableLineItemsTotal + taxesTotal,
  };

  return result;
};
