import isEmpty from 'lodash/isEmpty.js';
import pick from 'lodash/fp/pick.js';

import { mathRound2 } from '../../utils/math.js';

import {
  lineItemLinkedFieldsForSubscription,
  serviceItemLinkedFieldsForSubscription,
  subscriptionOrderLinkedFieldsForSubscription,
} from '../../consts/subscriptions.js';
import { getLinkedHistoricalIds } from './getLinkedHistoricalIds.js';

export const getServiceAndLineItemHistoricalIds = async (
  trx,
  schemaName,
  { serviceItems, skipQuerying = false },
  subscriptionOrdersHistoricals,
) => {
  const lineItems = [];
  const subscriptionOrders = [];
  let billableLineItemsTotal = 0;
  let billableSubscriptionOrdersTotal = 0;
  let billableServicesTotal = 0;
  const historicalIdsMap = {
    materials: {},
    billableServices: {},
  };
  const originalIdsMap = {
    materials: {},
    billableServices: {},
  };

  let serviceItemsMapped;

  if (!isEmpty(serviceItems)) {
    if (!skipQuerying) {
      serviceItemsMapped = await Promise.all(
        serviceItems.map(async item => {
          billableServicesTotal += mathRound2(Number(item.price || 0) * Number(item.quantity || 1));

          const updatedItem = await getLinkedHistoricalIds(
            trx,
            schemaName,
            // pre-pricing service code:
            // getHistoricalTableName,
            {
              linkedData: pick(serviceItemLinkedFieldsForSubscription)(item),
            },
          );

          historicalIdsMap.materials[item.materialId] = updatedItem.materialId;
          originalIdsMap.materials[updatedItem.materialId] = item.materialId;
          historicalIdsMap.billableServices[item.billableServiceId] = updatedItem.billableServiceId;
          originalIdsMap.billableServices[updatedItem.billableServiceId] = item.billableServiceId;

          lineItems.push(...(item.lineItems || []));
          subscriptionOrders.push(...(item.subscriptionOrders || []));

          return { ...item, ...updatedItem };
        }),
      );
    } else {
      serviceItemsMapped = serviceItems.map(item => {
        billableServicesTotal += mathRound2(Number(item.price || 0) * Number(item.quantity || 1));

        historicalIdsMap.materials[item.material.originalId] = item.materialId;
        originalIdsMap.materials[item.materialId] = item.material.originalId;
        historicalIdsMap.billableServices[item.billableService.originalId] = item.billableServiceId;
        originalIdsMap.billableServices[item.billableServiceId] = item.billableService.originalId;

        lineItems.push(...(item.lineItems || []));
        subscriptionOrders.push(...(item.subscriptionOrders || []));

        const { serviceFrequency, material, billableService, ...serviceItemMapped } = item;

        return { ...serviceItemMapped };
      });
    }
  }

  if (!skipQuerying) {
    if (!isEmpty(lineItems)) {
      await Promise.all(
        lineItems.map(async item => {
          billableLineItemsTotal += mathRound2(
            Number(item.price || 0) * Number(item.quantity || 1),
          );

          const updatedItem = await getLinkedHistoricalIds(
            trx,
            schemaName,
            // pre-pricing service code:
            // getHistoricalTableName,
            {
              linkedData: pick(lineItemLinkedFieldsForSubscription)(item),
            },
          );

          Object.assign(item, updatedItem);
        }),
      );
    }

    if (!isEmpty(subscriptionOrders) && !subscriptionOrdersHistoricals) {
      await Promise.all(
        subscriptionOrders.map(async item => {
          billableSubscriptionOrdersTotal += mathRound2(
            Number(item.price || 0) * Number(item.quantity || 1),
          );

          const updatedItem = await getLinkedHistoricalIds(
            trx,
            schemaName,
            // pre-pricing service code:
            // getHistoricalTableName,
            {
              linkedData: pick(subscriptionOrderLinkedFieldsForSubscription)(item),
            },
          );

          Object.assign(item, updatedItem);
        }),
      );
    }
  }

  return {
    serviceItems: serviceItemsMapped,
    billableServicesTotal,
    billableLineItemsTotal,
    billableSubscriptionOrdersTotal,
    historicalIdsMap,
    originalIdsMap,
  };
};
export const getServiceAndLineItemIds = async ({ serviceItems, skipQuerying = false }) => {
  const lineItems = [];
  const subscriptionOrders = [];
  let billableLineItemsTotal = 0;
  let billableSubscriptionOrdersTotal = 0;
  let billableServicesTotal = 0;
  const historicalIdsMap = {
    materials: {},
    billableServices: {},
  };
  const originalIdsMap = {
    materials: {},
    billableServices: {},
  };

  let serviceItemsMapped;

  if (!isEmpty(serviceItems)) {
    if (!skipQuerying) {
      serviceItemsMapped = await Promise.all(
        serviceItems.map(async item => {
          billableServicesTotal += mathRound2(Number(item.price || 0) * Number(item.quantity || 1));

          // const updatedItem = await getLinkedHistoricalIds(trx, schemaName, getHistoricalTableName, {
          //   linkedData: pick(serviceItemLinkedFieldsForSubscription)(item),
          // });

          historicalIdsMap.materials[item.materialId] = item.materialId;
          originalIdsMap.materials[item.materialId] = item.materialId;
          historicalIdsMap.billableServices[item.billableServiceId] = item.billableServiceId;
          originalIdsMap.billableServices[item.billableServiceId] = item.billableServiceId;

          lineItems.push(...(item.lineItems || []));
          subscriptionOrders.push(...(item.subscriptionOrders || []));

          return { ...item };
        }),
      );
    } else {
      serviceItemsMapped = serviceItems.map(item => {
        billableServicesTotal += mathRound2(Number(item.price || 0) * Number(item.quantity || 1));

        historicalIdsMap.materials[item.material.originalId] = item.materialId;
        originalIdsMap.materials[item.materialId] = item.material.originalId;
        historicalIdsMap.billableServices[item.billableService.originalId] = item.billableServiceId;
        originalIdsMap.billableServices[item.billableServiceId] = item.billableService.originalId;

        lineItems.push(...(item.lineItems || []));
        subscriptionOrders.push(...(item.subscriptionOrders || []));

        const { serviceFrequency, material, billableService, ...serviceItemMapped } = item;

        return { ...serviceItemMapped };
      });
    }
  }

  if (!skipQuerying) {
    if (!isEmpty(lineItems)) {
      await Promise.all(
        lineItems.map(async item => {
          billableLineItemsTotal += mathRound2(
            Number(item.price || 0) * Number(item.quantity || 1),
          );

          // const updatedItem = await getLinkedHistoricalIds(trx, schemaName, getHistoricalTableName, {
          //   linkedData: pick(lineItemLinkedFieldsForSubscription)(item),
          // });

          Object.assign(item);
        }),
      );
    }

    if (!isEmpty(subscriptionOrders)) {
      await Promise.all(
        subscriptionOrders.map(async item => {
          billableSubscriptionOrdersTotal += mathRound2(
            Number(item.price || 0) * Number(item.quantity || 1),
          );

          // const updatedItem = await getLinkedHistoricalIds(trx, schemaName, getHistoricalTableName, {
          //   linkedData: pick(subscriptionOrderLinkedFieldsForSubscription)(item),
          // });

          Object.assign(item);
        }),
      );
    }
  }

  return {
    serviceItems: serviceItemsMapped,
    billableServicesTotal,
    billableLineItemsTotal,
    billableSubscriptionOrdersTotal,
    historicalIdsMap,
    originalIdsMap,
  };
};
