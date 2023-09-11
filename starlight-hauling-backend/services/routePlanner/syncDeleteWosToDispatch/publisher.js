import MqSender from '../../amqp/sender.js';

import { AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH } from '../../../config.js';

const mqSender = MqSender.getInstance();

export const publisher = async (ctx, { isIndependent, deletedWorkOrders }) => {
  ctx.logger.debug(deletedWorkOrders, `syncDeleteWosToDispatch->publisher->deletedWorkOrders`);

  const ids = deletedWorkOrders.map(item => item.id);

  await mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_DELETE_WOS_TO_DISPATCH, {
    isIndependent,
    ids,
  });

  ctx.logger.info(`Queued sync of "${deletedWorkOrders.length}" deletion WOs to Dispatch`);
};
