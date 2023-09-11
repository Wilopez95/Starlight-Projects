import { pricingGetAllSubscriptionOrdersByIds } from '../../pricing.js';

export const prepareSubsWosForSyncToDispatch = async (ctx, workOrders) => {
  // pre-pricing service refactor code:
  // const subscriptionOrderIds = workOrders.map(swo => swo.subscriptionOrderId);
  // const relatedSubscriptionOrders = await SubscriptionOrdersRepo.getInstance(ctx.state).getAllByIds(
  //   {
  //     ids: subscriptionOrderIds,
  //     fields: ['id', 'sequenceId'],
  //   },
  // );

  // const subscriptionWorkOrdersToSync = workOrders.map(({ assignedRoute, ...restWo }) => {
  //   const matchedSubscriptionOrder = relatedSubscriptionOrders.find(
  //     wo => wo.id === restWo.subscriptionOrderId,
  const subscriptionOrderIds = workOrders.map(swo => swo.subscriptionOrderId);

  const relatedSubscriptionOrders = await pricingGetAllSubscriptionOrdersByIds(ctx, {
    data: { Ids: subscriptionOrderIds },
  });

  const subscriptionWorkOrdersToSync = workOrders.map(({ assignedRoute, ...restWo }) => {
    const matchedSubscriptionOrder = relatedSubscriptionOrders.find(
      wo => wo.id === restWo.subscriptionOrderId,
    );

    return {
      ...restWo,
      preferredRoute: assignedRoute,
      subscriptionOrderSequenceId: matchedSubscriptionOrder.sequenceId,
    };
  });

  return subscriptionWorkOrdersToSync;
};
