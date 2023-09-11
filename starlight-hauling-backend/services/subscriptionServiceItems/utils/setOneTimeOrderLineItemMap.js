import { mathRound2 } from '../../../utils/math.js';

export const setOneTimeOrderLineItemMap = ({
  serviceItem,
  subscriptionOrdersInputMap,
  serviceLineItemsInputMap,
  skipOneTime,
  idx,
}) => {
  const { lineItems: lineItemsInput, subscriptionOrders = [], materialId } = serviceItem;

  if (!skipOneTime) {
    subscriptionOrdersInputMap[idx] = subscriptionOrders.map(item => ({
      ...item,
      materialId,

      // TODO: fix by adding billableLineItemsTotal
      // TODO: make consistent: get it from FE only or calculate it on BE only
      grandTotal: mathRound2(Number(item.price || 0) * Number(item.quantity || 1)),
    }));
  }

  serviceLineItemsInputMap[idx] = lineItemsInput;
};
