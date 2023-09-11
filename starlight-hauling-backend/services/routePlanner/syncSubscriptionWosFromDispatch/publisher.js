import MqSender from '../../amqp/sender.js';

import {
  AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH,
  SUBSCRIPTION_WOS_SYNC_MAX_BATCH_SIZE,
} from '../../../config.js';

const mqSender = MqSender.getInstance();

// TODO: move this stub to test mocks when routePlanner service will be done
export const publisher = async (ctx, { subscriptionWorkOrders }) => {
  ctx.logger.debug(
    subscriptionWorkOrders,
    `
        syncSubsWosFromDispatch->publisher->subscriptionWorkOrders
    `,
  );
  const maxBatchSize = SUBSCRIPTION_WOS_SYNC_MAX_BATCH_SIZE || 50; // avoid 0
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
        mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH, {
          subscriptionWorkOrders: subscriptionWorkOrdersChunk,
        }),
      ),
    );
  } else {
    await mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_SUBSCRIPTION_WOS_FROM_DISPATCH, {
      subscriptionWorkOrders,
    });
  }
  ctx.logger.info(`Queued sync of "${subscriptionWorkOrders.length}" WOs from Dispatch`);
};
