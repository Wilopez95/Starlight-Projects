import { SUBSCTIPTION_HISTORY_ACTION } from '../../consts/subscriptionHistoryActions.js';
import { SUBSCTIPTION_HISTORY_ENTITY } from '../../consts/subscriptionHistoryEntities.js';
import { SERVICE_ITEM_ATTRIBUTES } from '../../consts/subscriptionServiceItemHistoryAttributes.js';
import { LINE_ITEM_ATTRIBUTES } from '../../consts/subscriptionLineItemHistoryAttributes.js';
import { SUBSCRIPTION_ORDER_ATTRIBUTES } from '../../consts/subscriptionOrderHistoryAttributes.js';
import {
  getDeltaByServiceItemAttributes,
  getDeltaByLineItemAttributes,
  getDeltaBySubscriptionOrderAttributes,
} from './utils.js';
import { getServiceDaysHistoryData } from './getServiceDaysHistoryData.js';

export const getServiceItemsHistoryData = (
  subscriptionId,
  user,
  oldServiceItems,
  newServiceItems,
  subscriptionServiceItemsUpdates,
  subscriptionLineItemsUpdates,
  oneTimeSubscriptionOrdersUpdates,
) => {
  const serviceItemsHistoryData = [];
  const lineItemsHistoryData = [];
  const subscriptionOrdersHistoryData = [];

  const { addServiceItems, editServiceItems, removeServiceItems } = subscriptionServiceItemsUpdates;
  const { addLineItems, editLineItems, removeLineItems } = subscriptionLineItemsUpdates;
  const { addSubscriptionOrders, editSubscriptionOrders, removeSubscriptionOrders } =
    oneTimeSubscriptionOrdersUpdates;

  const oldLineItems = [];
  const newLineItems = [];
  const oldSubscriptionOrders = [];
  const newSubscriptionOrders = [];

  const oldServiceItemsMap = oldServiceItems.reduce((res, item) => {
    oldLineItems.push(...item.lineItems);
    oldSubscriptionOrders.push(...item.subscriptionOrders);
    res[item.id] = item;
    return res;
  }, {});

  const newServiceItemsMap = newServiceItems.reduce((res, item) => {
    newLineItems.push(...item.lineItems);
    newSubscriptionOrders.push(...item.subscriptionOrders);
    res[item.id] = item;
    return res;
  }, {});

  const oldLineItemsMap = oldLineItems.reduce((res, item) => {
    res[item.id] = item;
    return res;
  }, {});

  const newLineItemsMap = newLineItems.reduce((res, item) => {
    res[item.id] = item;
    return res;
  }, {});

  const oldSubscriptionOrdersMap = oldSubscriptionOrders.reduce((res, item) => {
    res[item.id] = item;
    return res;
  }, {});

  const newSubscriptionOrdersMap = newSubscriptionOrders.reduce((res, item) => {
    res[item.id] = item;
    return res;
  }, {});

  if (addServiceItems) {
    newServiceItems.forEach(newServiceItem => {
      if (!oldServiceItemsMap[newServiceItem.id]) {
        serviceItemsHistoryData.push({
          subscriptionId,
          action: SUBSCTIPTION_HISTORY_ACTION.added,
          entity: SUBSCTIPTION_HISTORY_ENTITY.recurrentService,
          madeBy: user.name,
          madeById: user.id,
          description: {
            newValue: newServiceItem.billableService.description,
          },
        });
      }
    });
  }

  if (editServiceItems) {
    editServiceItems.forEach(({ id, effectiveDate }) => {
      const oldServiceItem = oldServiceItemsMap[id];
      const newServiceItem = newServiceItemsMap[id];
      const serviceName = oldServiceItem.billableService.description;

      const delta = getDeltaByServiceItemAttributes(
        SERVICE_ITEM_ATTRIBUTES,
        oldServiceItem,
        newServiceItem,
      );

      delta.forEach(({ attribute, newValue, previousValue }) => {
        serviceItemsHistoryData.push({
          subscriptionId,
          action: SUBSCTIPTION_HISTORY_ACTION.changed,
          effectiveDate,
          entity: SUBSCTIPTION_HISTORY_ENTITY.recurrentService,
          attribute,
          madeBy: user.name,
          madeById: user.id,
          description: {
            serviceName,
            newValue,
            previousValue,
          },
        });
      });

      const serviceDaysHistoryData = getServiceDaysHistoryData({
        subscriptionId,
        serviceName,
        effectiveDate,
        user,
        oldServiceDays: oldServiceItem.serviceDaysOfWeek,
        newServiceDays: newServiceItem.serviceDaysOfWeek,
      });

      serviceItemsHistoryData.push(...serviceDaysHistoryData);
    });
  }

  if (removeServiceItems) {
    removeServiceItems.forEach(({ id }) => {
      const removedServiceItem = oldServiceItemsMap[id];
      serviceItemsHistoryData.push({
        subscriptionId,
        action: SUBSCTIPTION_HISTORY_ACTION.removed,
        entity: SUBSCTIPTION_HISTORY_ENTITY.recurrentService,
        madeBy: user.name,
        madeById: user.id,
        description: {
          previousValue: removedServiceItem.billableService.description,
        },
      });
    });
  }

  if (addLineItems) {
    newLineItems.forEach(newLineItem => {
      if (!oldLineItemsMap[newLineItem.id]) {
        lineItemsHistoryData.push({
          subscriptionId,
          action: SUBSCTIPTION_HISTORY_ACTION.added,
          effectiveDate: addLineItems.shift().effectiveDate,
          entity: SUBSCTIPTION_HISTORY_ENTITY.recurrentLineItem,
          madeBy: user.name,
          madeById: user.id,
          description: {
            serviceName:
              oldServiceItemsMap[newLineItem.subscriptionServiceItemId]?.billableService
                ?.description,
            newValue: newLineItem.billableLineItem.description,
            quantity: newLineItem.quantity,
          },
        });
      }
    });
  }

  if (editLineItems) {
    editLineItems.forEach(({ id, effectiveDate }) => {
      const newLineItem = newLineItemsMap[id];
      const delta = getDeltaByLineItemAttributes(
        LINE_ITEM_ATTRIBUTES,
        oldLineItemsMap[id],
        newLineItem,
      );

      delta.forEach(({ attribute, newValue, previousValue }) => {
        lineItemsHistoryData.push({
          subscriptionId,
          action: SUBSCTIPTION_HISTORY_ACTION.changed,
          effectiveDate,
          entity: SUBSCTIPTION_HISTORY_ENTITY.recurrentLineItem,
          attribute,
          madeBy: user.name,
          madeById: user.id,
          description: {
            serviceName:
              oldServiceItemsMap[newLineItem.subscriptionServiceItemId]?.billableService
                ?.description,
            lineItemName: newLineItem.billableLineItem.description,
            newValue,
            previousValue,
          },
        });
      });
    });
  }

  if (removeLineItems) {
    removeLineItems.forEach(({ id }) => {
      const removedLineItem = oldLineItemsMap[id];
      lineItemsHistoryData.push({
        subscriptionId,
        action: SUBSCTIPTION_HISTORY_ACTION.removed,
        entity: SUBSCTIPTION_HISTORY_ENTITY.recurrentLineItem,
        madeBy: user.name,
        madeById: user.id,
        description: {
          serviceName:
            oldServiceItemsMap[removedLineItem.subscriptionServiceItemId]?.billableService
              ?.description,
          previousValue: removedLineItem.billableLineItem.description,
          quantity: removedLineItem.quantity,
        },
      });
    });
  }

  if (addSubscriptionOrders) {
    newSubscriptionOrders.forEach(newSubscriptionOrder => {
      if (!oldSubscriptionOrdersMap[newSubscriptionOrder.id]) {
        subscriptionOrdersHistoryData.push({
          subscriptionId,
          action: SUBSCTIPTION_HISTORY_ACTION.added,
          entity: SUBSCTIPTION_HISTORY_ENTITY.subscriptionOrder,
          madeBy: user.name,
          madeById: user.id,
          description: {
            serviceName:
              oldServiceItemsMap[newSubscriptionOrder.subscriptionServiceItemId]?.billableService
                ?.description,
            newValue: newSubscriptionOrder.billableService.description,
          },
        });
      }
    });
  }

  if (editSubscriptionOrders) {
    editSubscriptionOrders.forEach(({ id, effectiveDate }) => {
      const newSubscriptionOrder = newSubscriptionOrdersMap[id];
      const delta = getDeltaBySubscriptionOrderAttributes(
        SUBSCRIPTION_ORDER_ATTRIBUTES,
        oldSubscriptionOrdersMap[id],
        newSubscriptionOrder,
      );

      delta.forEach(({ attribute, newValue, previousValue }) => {
        subscriptionOrdersHistoryData.push({
          subscriptionId,
          action: SUBSCTIPTION_HISTORY_ACTION.changed,
          effectiveDate,
          entity: SUBSCTIPTION_HISTORY_ENTITY.subscriptionOrder,
          attribute,
          madeBy: user.name,
          madeById: user.id,
          description: {
            serviceName:
              oldServiceItemsMap[newSubscriptionOrder.subscriptionServiceItemId]?.billableService
                ?.description,
            subscriptionOrderName: newSubscriptionOrder.billableService.description,
            newValue,
            previousValue,
          },
        });
      });
    });
  }

  if (removeSubscriptionOrders) {
    removeSubscriptionOrders.forEach(({ id }) => {
      const removedSubscriptionOrder = oldSubscriptionOrdersMap[id];
      subscriptionOrdersHistoryData.push({
        subscriptionId,
        action: SUBSCTIPTION_HISTORY_ACTION.removed,
        entity: SUBSCTIPTION_HISTORY_ENTITY.subscriptionOrder,
        madeBy: user.name,
        madeById: user.id,
        description: {
          serviceName:
            oldServiceItemsMap[removedSubscriptionOrder.subscriptionServiceItemId]?.billableService
              ?.description,
          previousValue: removedSubscriptionOrder.billableService.description,
        },
      });
    });
  }

  return [...serviceItemsHistoryData, ...lineItemsHistoryData, ...subscriptionOrdersHistoryData];
};
