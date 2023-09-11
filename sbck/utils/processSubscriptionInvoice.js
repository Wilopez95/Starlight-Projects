/* eslint-disable prefer-const */
import cloneDeep from 'lodash/cloneDeep.js';
import { InvoiceType } from '../consts/invoiceTypes.js';
import { SubChildEntity, DefaultServiceEntity } from '../consts/subscriptionEntity.js';
import { ONE_TIME_ACTION } from '../consts/actions.js';
import { DEFAULT_NOT_A_SERVICE_NAME } from '../consts/defaults.js';
import { pricingGetSubscriptionServiceItemById } from '../services/pricing.js';
import { mathRound2 } from './math.js';

const ROOT_ENTITIES = [
  SubChildEntity.SERVICE_ITEM,
  SubChildEntity.SUBSCRIPTION_ORDER,
  SubChildEntity.SUBSCRIPTION_ORDER_NON_SERVICE,
];

const processSubscriptionInvoice = customerId => subscription => {
  const {
    jobSite: { id: jobSiteId },
    ...rest
  } = subscription;

  return {
    jobSite: { id: jobSiteId },
    customerId,
    ...rest,
  };
};

const setUpIndices = entities => {
  let index = 0;
  let secondIndex = 0;
  let prev;

  for (const item of entities) {
    if (ROOT_ENTITIES.includes(item.type)) {
      index++;
      secondIndex = 0;
    }

    if (item.type !== prev?.type) {
      secondIndex++;
    }

    item.index = index;
    item.secondIndex = secondIndex;

    prev = item;
  }

  return entities;
};

const recalculateTotalPrice = entities => {
  let sum = 0;
  for (let i = entities.length - 1; i >= 0; i--) {
    sum += entities[i].price * entities[i].quantity || 0;

    if (ROOT_ENTITIES.includes(entities[i].type)) {
      entities[i].grandTotal = mathRound2(sum);
      sum = 0;
    }
  }

  return entities;
};

const formatInvoicedSubChildEntities = ({
  serviceItems,
  serviceName,
  serviceItemId,
  lineItems,
}) => {
  const invoicedInfo = [
    ...(serviceName === DEFAULT_NOT_A_SERVICE_NAME ? [] : serviceItems).map(serviceItem => {
      const { since, from, ...restLineItem } = serviceItem;
      delete restLineItem.subscriptionOrders;
      return {
        entityId: serviceItemId,
        serviceName,
        type: SubChildEntity.SERVICE_ITEM,
        periodSince: since,
        periodTo: from,
        ...restLineItem,
      };
    }),

    ...lineItems.map(lineItem => {
      const { lineItemId, since, from, ...restLineItem } = lineItem;
      return {
        entityId: lineItemId,
        periodSince: since,
        type: SubChildEntity.LINE_ITEM,
        periodTo: from,
        ...restLineItem,
      };
    }),

    ...serviceItems.flatMap(serviceItem => {
      const { subscriptionOrders = [] } = serviceItem;

      return subscriptionOrders
        .filter(
          ({ price, quantity, subOrderLineItems }) =>
            (price && quantity) || subOrderLineItems?.length,
        )
        .flatMap(order => {
          const {
            subscriptionOrderId: id,
            action,
            subOrderLineItems = [],
            serviceDate,
            ...rest
          } = order;

          let subscriptionOrderType;
          let subscriptionOrderLineItemType;

          if (action === ONE_TIME_ACTION.notService) {
            subscriptionOrderType = SubChildEntity.SUBSCRIPTION_ORDER_NON_SERVICE;
            subscriptionOrderLineItemType = SubChildEntity.SUBSCRIPTION_ORDER_NON_SERVICE_LINE_ITEM;
          } else if (serviceName === DEFAULT_NOT_A_SERVICE_NAME) {
            subscriptionOrderType = SubChildEntity.SUBSCRIPTION_ORDER;
            subscriptionOrderLineItemType = SubChildEntity.SUBSCRIPTION_ORDER_LINE_ITEM;
          } else {
            subscriptionOrderType = SubChildEntity.SUBSCRIPTION_ORDER_SERVICE;
            subscriptionOrderLineItemType = SubChildEntity.SUBSCRIPTION_ORDER_SERVICE_LINE_ITEM;
          }

          return [
            {
              entityId: id,
              type: subscriptionOrderType,
              serviceDate,
              ...rest,
            },
            ...subOrderLineItems.map(subOrderLineItem => {
              const { id: subOrderLineItemId, ...subOrderLineItemRest } = subOrderLineItem;
              return {
                entityId: subOrderLineItemId,
                type: subscriptionOrderLineItemType,
                serviceDate,
                ...subOrderLineItemRest,
              };
            }),
          ];
        });
    }),
  ];
  return {
    invoicedInfo,
  };
};

export const prepareSubscriptions = async ({ subscriptions = [], customerId }, ctx) => {
  const subscriptionInfo = [];
  const processSubItems = {};

  const processedSubscriptions = subscriptions.map(processSubscriptionInvoice(customerId));

  for (const sub of processedSubscriptions) {
    const serviceItemsData = await pricingGetSubscriptionServiceItemById(ctx, {
      data: { id: sub.id },
    });

    let { summaryPerServiceItem, ...rest } = sub;

    // move non services to bottom
    summaryPerServiceItem = summaryPerServiceItem.sort(
      (a, b) =>
        Number(a.serviceName === DEFAULT_NOT_A_SERVICE_NAME) -
        Number(b.serviceName === DEFAULT_NOT_A_SERVICE_NAME),
    );

    for (const subServiceItem of summaryPerServiceItem) {
      const { serviceItems, lineItems = [], serviceItemId, serviceName } = subServiceItem;
      const { invoicedInfo } = formatInvoicedSubChildEntities({
        serviceItems,
        serviceName,
        serviceItemId,
        lineItems,
      });
      processSubItems[rest.id] = processSubItems[rest.id]?.length
        ? processSubItems[rest.id].concat(...invoicedInfo)
        : invoicedInfo;
    }

    processSubItems[rest.id] = setUpIndices(processSubItems[rest.id]);
    processSubItems[rest.id] = recalculateTotalPrice(processSubItems[rest.id]);

    const newSubsData = {
      ...rest,
      // type: 'LINE ITEMS', //ToDo Find the type
      serviceDate: serviceItemsData[0].invoicedDate,
      // periodSince: '2023-01-25', //ToDo Find the periodSince
      // periodTo: '2023-01-25', //ToDo Find the periodTo
      serviceName: serviceItemsData[0].billableService.description,
      price: serviceItemsData[0].price,
      quantity: serviceItemsData[0].quantity,
      totalPrice: Number(serviceItemsData[0].price * serviceItemsData[0].quantity),
    };

    subscriptionInfo.push(newSubsData);
  }

  return {
    processSubItems,
    subscriptions: subscriptionInfo,
  };
};

export const subscriptionAggregate = info => {
  const result = [];
  for (const infosObj of info) {
    const { subscriptionsInfo, subscriptionInvoicedEntity } = infosObj;
    for (const subscriptionInfo of subscriptionsInfo) {
      const { subscriptionInvoiceId, ...subRest } = subscriptionInfo;

      const subscriptionServiceInfo = {
        ...subRest,
        serviceItems: [],
        type: InvoiceType.SUBSCRIPTIONS,
        nonServiceOrder: [],
      };

      const invoicedEntities = subscriptionInvoicedEntity.filter(
        obj => obj.subscriptionInvoiceId === subscriptionInvoiceId,
      );

      for (const invoiceEntity of invoicedEntities) {
        const { type } = invoiceEntity;

        if (type === SubChildEntity.SERVICE_ITEM) {
          const { entityId, serviceName, ...serviceItemRest } = invoiceEntity;
          subscriptionServiceInfo.serviceItems.push({
            serviceItemId: entityId,
            serviceName,
            serviceItems: [
              {
                ...serviceItemRest,
                subscriptionOrders: [],
              },
            ],
            lineItems: [],
            nonServiceOrder: [],
          });
        }

        if (type === SubChildEntity.LINE_ITEM) {
          const { entityId, ...lineItemRest } = invoiceEntity;
          const serviceItemsIndex = subscriptionServiceInfo.serviceItems.length - 1;

          subscriptionServiceInfo.serviceItems[serviceItemsIndex].lineItems.push({
            ...lineItemRest,
            id: entityId,
          });
        }

        if (type === SubChildEntity.SUBSCRIPTION_ORDER_NON_SERVICE) {
          const { entityId, ...nonServiceOrderRest } = invoiceEntity;

          subscriptionServiceInfo.nonServiceOrder.push({
            ...nonServiceOrderRest,
            id: entityId,
            subOrderLineItems: [],
          });
        }

        if (type === SubChildEntity.SUBSCRIPTION_ORDER) {
          subscriptionServiceInfo.serviceItems.push(cloneDeep(DefaultServiceEntity));
        }

        if (
          [SubChildEntity.SUBSCRIPTION_ORDER, SubChildEntity.SUBSCRIPTION_ORDER_SERVICE].includes(
            type,
          )
        ) {
          const { entityId, ...subOrderRest } = invoiceEntity;

          // in case of auto generate order not display them
          if (Number(subOrderRest.price) === 0 && Number(subOrderRest.grandTotal) === 0) {
            continue;
          }

          const serviceItemsIndex = subscriptionServiceInfo.serviceItems.length - 1;
          const nestedServiceItemIndex =
            subscriptionServiceInfo.serviceItems[serviceItemsIndex].serviceItems.length - 1;

          subscriptionServiceInfo.serviceItems[serviceItemsIndex].serviceItems[
            nestedServiceItemIndex
          ].subscriptionOrders.push({
            ...subOrderRest,
            id: entityId,
            subOrderLineItems: [],
          });
        }

        if (type === SubChildEntity.SUBSCRIPTION_ORDER_NON_SERVICE_LINE_ITEM) {
          const { entityId, ...nonServiceOrderRest } = invoiceEntity;

          const nestedServiceItemIndex = subscriptionServiceInfo.nonServiceOrder.length - 1;

          subscriptionServiceInfo.nonServiceOrder[nestedServiceItemIndex].subOrderLineItems.push({
            ...nonServiceOrderRest,
            id: entityId,
          });
        }

        if (
          [
            SubChildEntity.SUBSCRIPTION_ORDER_LINE_ITEM,
            SubChildEntity.SUBSCRIPTION_ORDER_SERVICE_LINE_ITEM,
          ].includes(type)
        ) {
          const { entityId, ...subOrderRest } = invoiceEntity;

          const { [subscriptionServiceInfo.serviceItems.length - 1]: serviceItems1 } =
            subscriptionServiceInfo.serviceItems;
          const { [serviceItems1.serviceItems.length - 1]: serviceItems2 } =
            serviceItems1.serviceItems;
          const { [serviceItems2.subscriptionOrders.length - 1]: subscriptionOrders } =
            serviceItems2.subscriptionOrders;

          subscriptionOrders.subOrderLineItems.push({
            ...subOrderRest,
            id: entityId,
          });
        }
      }
      result.push(subscriptionServiceInfo);
    }
  }

  return result;
};
