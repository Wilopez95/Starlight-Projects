import MqSender from '../sender.js';

import {
  AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH,
  SUBSCRIPTION_SERVICE_ITEMS_SYNC_MAX_BATCH_SIZE,
} from '../../../config.js';

const mqSender = MqSender.getInstance();

export const publisher = async (ctx, { serviceItems }) => {
  if (!serviceItems.length) {
    return;
  }

  const maxBatchSize = SUBSCRIPTION_SERVICE_ITEMS_SYNC_MAX_BATCH_SIZE ?? 50; // avoid 0

  if (serviceItems.length > maxBatchSize) {
    const chunksNumber = Math.ceil(serviceItems.length / maxBatchSize);
    const chunks = serviceItems.reduce((acc, _, idx) => {
      if (idx % chunksNumber === 0) {
        acc.push(serviceItems.slice(idx, idx + chunksNumber));
      }
      return acc;
    }, []);

    await Promise.all(
      chunks.map(dataChunk =>
        mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH, {
          serviceItems: dataChunk,
        }),
      ),
    );
  } else {
    await mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_FROM_DISPATCH, {
      serviceItems,
    });
  }

  ctx.logger.info(`Queued sync of "${serviceItems.length}" subscription service items to Hauling`);
};
