import omit from 'lodash/omit.js';
import OrderRepo from '../../repos/v2/order.js';
import { pricingUpsertThreshold } from '../pricing.js';
import calculateThresholds from './calculateThresholds.js';

const reCalculateThresholds = async (ctx, { order, workOrder, save = true }, trx) => {
  ctx.logger.debug(`reCalculateThresholds->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(`reCalculateThresholds->workOrder: ${JSON.stringify(workOrder, null, 2)}`);

  const orderRepo = OrderRepo.getInstance(ctx.state);

  try {
    const thresholdsItems = await calculateThresholds(ctx, { order, workOrder }, trx);

    let thresholdsToUpsert;
    let thresholdsTotal;
    if (thresholdsItems?.length) {
      ({ thresholds: thresholdsToUpsert, thresholdsTotal } =
        await orderRepo.getThresholdHistoricalIds(
          thresholdsItems,
          orderRepo.getLinkedHistoricalIds.bind(orderRepo),
          trx,
        ));
    }

    if (save && thresholdsToUpsert?.length) {
      const thresholds = thresholdsToUpsert?.map(thresholdToUpsert =>
        omit(thresholdToUpsert, 'materialId'),
      );
      // upsert thresholds to the related order
      const updateItems = await pricingUpsertThreshold(ctx, {
        data: { data: thresholds },
      });
      thresholdsItems.forEach((item, i) => (item.id = updateItems[i].id));
    }

    return { thresholdsTotal: thresholdsTotal || 0, thresholdsItems };
  } catch (error) {
    ctx.logger.error(
      error,
      `Error while re-calculating thresholds for an order with id ${order.id}`,
    );
    throw error;
  }
};

export default reCalculateThresholds;
