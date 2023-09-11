import MqSender from '../../amqp/sender.js';

import { AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH } from '../../../config.js';

const mqSender = MqSender.getInstance();

// TODO: move this stub to test mocks when routePlanner service will be done
export const publisher = async (ctx, { independentOrders }) => {
  ctx.logger.debug(independentOrders, `syncSubsWosFromDispatch->publisher->independentOrders`);

  await mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_INDEPENDENT_WOS_FROM_DISPATCH, {
    independentOrders,
  });

  ctx.logger.info(`Queued sync of "${independentOrders.length}" WOs from Dispatch`);
};
