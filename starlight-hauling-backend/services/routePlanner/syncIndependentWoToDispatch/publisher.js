import IndependentWorkOrder from '../../../repos/independentWorkOrder.js';

import MqSender from '../../amqp/sender.js';

import {
  AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH,
  DISABLE_INDEPENDENT_ORDERS_SYNC_WITH_DISPATCH,
} from '../../../config.js';

const mqSender = MqSender.getInstance();

export const publisher = async (ctx, { independentWorkOrders }) => {
  ctx.logger.debug(
    independentWorkOrders,
    `syncIndependentWosToDispatch->publisher->independentWorkOrder`,
  );

  const [independentWorkOrder] = independentWorkOrders;
  ctx.logger.debug(
    `syncIndependentWosToDispatch->publisher->preferredRoute:
         ${independentWorkOrder.preferredRoute}`,
  );
  if (DISABLE_INDEPENDENT_ORDERS_SYNC_WITH_DISPATCH) {
    return;
  }

  const independentWorkOrderDetails = await IndependentWorkOrder.getInstance(
    ctx.state,
  ).getDetailsForRoutePlanner({
    workOrderId: independentWorkOrder.independentWorkOrderId,
  });

  await mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_INDEPENDENT_WOS_TO_DISPATCH, {
    independentWorkOrders,
    independentWorkOrderDetails,
  });

  ctx.logger.info(`Queued sync of Independent WO to Dispatch`);
};
