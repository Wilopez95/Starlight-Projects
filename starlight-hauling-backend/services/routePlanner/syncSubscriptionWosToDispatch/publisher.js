import MqSender from '../../amqp/sender.js';

import {
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH,
  SUBSCRIPTION_WOS_SYNC_MAX_BATCH_SIZE,
} from '../../../config.js';
import { prepareSubsWosForSyncToDispatch } from '../utils/workOrderHelper.js';

const mqSender = MqSender.getInstance();

export const publisher = async (
  ctx,
  { subscriptionWorkOrders: subWoRaw, subscriptionWorkOrderDetails },
) => {
  const subscriptionWorkOrders = await prepareSubsWosForSyncToDispatch(ctx, subWoRaw);

  ctx.logger.debug(
    subscriptionWorkOrders,
    `syncSubsWosToDispatch->publisher->subscriptionWorkOrders`,
  );

  const maxBatchSize = Number(SUBSCRIPTION_WOS_SYNC_MAX_BATCH_SIZE) || 50; // avoid 0
  if (subscriptionWorkOrders.length > maxBatchSize) {
    const chunksNumber = Math.ceil(subscriptionWorkOrders.length / maxBatchSize);
    const chunks = subscriptionWorkOrders.reduce((acc, _, idx) => {
      if (idx % chunksNumber === 0) {
        acc.push(subscriptionWorkOrders.slice(idx, idx + chunksNumber));
      }
      return acc;
    }, []);
    await Promise.all(
      chunks.map(subscriptionWorkOrdersChunk =>
        mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH, {
          subscriptionWorkOrders: subscriptionWorkOrdersChunk,
          subscriptionWorkOrderDetails,
        }),
      ),
    );
  } else {
    await mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_TO_DISPATCH, {
      subscriptionWorkOrders,
      subscriptionWorkOrderDetails,
    });
  }
  ctx.logger.info(`Queued sync of "${subscriptionWorkOrders.length}" WOs to Dispatch`);
};
