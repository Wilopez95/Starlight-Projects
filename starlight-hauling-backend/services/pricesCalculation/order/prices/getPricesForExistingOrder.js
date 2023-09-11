import pick from 'lodash/fp/pick.js';
import find from 'lodash/find.js';
import orderRepository from '../../../../repos/order.js';
import {
  replaceLegacyWithRefactoredFieldsDeep,
  prefixKeyWithRefactored,
} from '../../../../utils/priceRefactoring.js';

const ORDER_FIELDS = [
  'id',
  'priceId',
  'billableServicePrice',
  'lineItems',
  'thresholds',
  'applySurcharges',
  'taxDistricts',
  'commercialTaxesUsed',
].map(prefixKeyWithRefactored); // TODO: remove after refactoring

const pickSurchargeFields = pick([
  'amount',
  'calculation',
  'surchargeId',
  'billableServiceId',
  'billableLineItemId',
  'thresholdId',
  'materialBasedPricing',
  'materialId',
  'quantity',
  'total',
]);

const getPricesForExistingOrder = async (
  ctx,
  { orderId } = {},
  { orderRepo = orderRepository } = {},
  trx,
) => {
  const order = await orderRepo.getInstance(ctx.state).getBy(
    {
      condition: { id: orderId },
      fields: ORDER_FIELDS,
    },
    trx,
  );

  const refactoredOrder = replaceLegacyWithRefactoredFieldsDeep(order);

  refactoredOrder.quantity = 1;
  refactoredOrder.orderId = refactoredOrder.id;
  refactoredOrder.price = refactoredOrder.billableServicePrice;
  refactoredOrder.total = Math.trunc(refactoredOrder.price * refactoredOrder.quantity);

  refactoredOrder.lineItems = refactoredOrder.lineItems?.map(lineItem => {
    lineItem.lineItemId = lineItem.id;
    lineItem.total = Math.trunc(lineItem.price * lineItem.quantity);

    return lineItem;
  });

  refactoredOrder.thresholds = refactoredOrder.thresholds?.map(threshold => {
    threshold.thresholdItemId = threshold.id;
    threshold.total = Math.trunc(threshold.price * threshold.quantity);

    return threshold;
  });

  refactoredOrder.surcharges = refactoredOrder.surcharges?.map(surcharge => {
    surcharge.rate = surcharge?.price?.price ?? null;
    surcharge.calculation = surcharge.surcharge.calculation;
    surcharge.materialBasedPricing = surcharge.surcharge.materialBasedPricing;

    if (surcharge.thresholdId) {
      const found = find(refactoredOrder.thresholds, { thresholdId: surcharge.thresholdId });
      surcharge.total = found.total;
    } else if (surcharge.billableLineItemId) {
      const found = find(refactoredOrder.lineItems, {
        billableLineItemId: surcharge.billableLineItemId,
      });
      surcharge.total = found.total;
    } else if (surcharge.billableServiceId) {
      surcharge.total = refactoredOrder.total;
    }

    return pickSurchargeFields(surcharge);
  });

  return refactoredOrder;
};

export default getPricesForExistingOrder;
