import MqSender from '../sender.js';

import {
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH,
  WOS_SYNC_MAX_BATCH_SIZE,
} from '../../../config.js';

const mqSender = MqSender.getInstance();

export const publisher = async (ctx, { data }) => {
  if (!data.length) {
    return;
  }

  const maxBatchSize = WOS_SYNC_MAX_BATCH_SIZE ?? 50; // avoid 0

  if (data.length > maxBatchSize) {
    const chunksNumber = Math.ceil(data.length / maxBatchSize);
    const chunks = data.reduce((acc, _, idx) => {
      if (idx % chunksNumber === 0) {
        acc.push(data.slice(idx, idx + chunksNumber));
      }
      return acc;
    }, []);

    await Promise.all(
      chunks.map(dataChunk =>
        mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH, {
          independentOrders: dataChunk,
        }),
      ),
    );
  } else {
    await mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH, {
      independentOrders: data,
    });
  }

  ctx.logger.info(`Queued sync of "${data.length}" independent WOs to Hauling`);
};
