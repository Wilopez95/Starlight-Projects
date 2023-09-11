import { logger } from '../../../../utils/logger.js';

const sumSurchargeAmounts = (surchargesTotal, { amount = 0 }) => surchargesTotal + amount;

const getOrderTotalsWithSurcharges = (orders = [], surcharges = []) =>
  orders?.map((order, idx) => {
    // logger.debug(`getOrderTotalsWithSurcharges->orders: ${JSON.stringify(orders, null, 2)}`);
    logger.debug(
      `getOrderTotalsWithSurcharges->surcharges: ${JSON.stringify(surcharges, null, 2)}`,
    );
    const serviceSurchargesTotal =
      surcharges?.[idx]
        ?.filter(({ billableServiceId }) => billableServiceId === order.billableServiceId)
        .reduce(sumSurchargeAmounts, 0) || 0;
    logger.debug(`getOrderTotalsWithSurcharges->serviceSurchargesTotal: ${serviceSurchargesTotal}`);

    order.surchargesTotal = serviceSurchargesTotal;
    order.totalWithSurcharges = (order.total || 0) + serviceSurchargesTotal;
    order.includingSurcharges = serviceSurchargesTotal > 0;
    logger.debug(`getOrderTotalsWithSurcharges->surchargesTotal: ${order.surchargesTotal}`);
    logger.debug(`getOrderTotalsWithSurcharges->totalWithSurcharges: ${order.totalWithSurcharges}`);
    logger.debug(`getOrderTotalsWithSurcharges->includingSurcharges: ${order.includingSurcharges}`);

    order.lineItems = order.lineItems.map(lineItem => {
      const lineItemSurchargesTotal =
        surcharges?.[idx]
          ?.filter(({ billableLineItemId }) => billableLineItemId === lineItem.billableLineItemId)
          .reduce(sumSurchargeAmounts, 0) || 0;

      lineItem.surchargesTotal = lineItemSurchargesTotal;
      lineItem.totalWithSurcharges = (lineItem.total || 0) + lineItemSurchargesTotal;
      lineItem.includingSurcharges = lineItemSurchargesTotal > 0;

      return lineItem;
    });
    logger.debug(
      `getOrderTotalsWithSurcharges->lineItems: ${JSON.stringify(order.lineItems, null, 2)}`,
    );

    order.thresholds = order.thresholds.map(threshold => {
      const thresholdSurchargesTotal =
        surcharges?.[idx]
          ?.filter(({ thresholdId }) => thresholdId === threshold.thresholdId)
          .reduce(sumSurchargeAmounts, 0) || 0;

      threshold.surchargesTotal = thresholdSurchargesTotal;
      threshold.totalWithSurcharges = (threshold.total || 0) + thresholdSurchargesTotal;
      threshold.includingSurcharges = thresholdSurchargesTotal > 0;

      return threshold;
    });
    logger.debug(
      `getOrderTotalsWithSurcharges->thresholds: ${JSON.stringify(order.thresholds, null, 2)}`,
    );

    return order;
  });

export default getOrderTotalsWithSurcharges;
