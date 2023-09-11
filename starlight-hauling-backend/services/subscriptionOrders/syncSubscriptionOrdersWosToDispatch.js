import fpPick from 'lodash/fp/pick.js';
import { publishers } from '../routePlanner/publishers.js';
import { WO_FIELDS_TO_SYNC_WITH_DISPATCH } from '../../consts/workOrder.js';
import {
  pricingGetSubscriptionsDetailsForRoutePlanner,
  pricingGetBySubscriptionWorkOrder,
} from '../pricing.js';

// eslint-disable-next-line no-unused-vars
export const syncSubscriptionOrderWosToDispatch = async (ctx, { subscriptionOrder }, trx) => {
  const { schemaName, userId } = ctx.state.user;
  // pre-pricing service code:

  // const serviceItemDetails = await SubscriptionsServiceItemsRepo.getInstance(
  //   ctx.state,
  // ).getDetailsForRoutePlanner({
  //   serviceItemId: subscriptionOrder.subscriptionServiceItemId,
  //   thirdPartyHaulerId: subscriptionOrder.thirdPartyHaulerId,
  // });

  // const count = await proceedInBatches(
  //   {
  //     repo: SubscriptionWorkOrdersRepo.getInstance(ctx.state),
  //     condition: { subscriptionOrderId: subscriptionOrder.id },
  //     fields: WO_FIELDS_TO_SYNC_WITH_DISPATCH,
  //     orderByField: 'id',
  //     lastId: 1,
  //     count: 0,
  //     cb: async items => {
  //       await publishers.syncToDispatch(ctx, {
  //         schema: schemaName,
  //         userId,
  //         subscriptionWorkOrders: items,
  //         subscriptionWorkOrderDetails: serviceItemDetails,
  //       });
  //     },
  //   },
  //   trx,
  // );
  // end of pre-pricing service code
  const serviceItemDetails = await pricingGetSubscriptionsDetailsForRoutePlanner(ctx, {
    data: { id: subscriptionOrder.subscriptionServiceItemId },
  });

  // const count = await proceedInBatches(
  //   {
  //     repo: SubscriptionWorkOrdersRepo.getInstance(ctx.state),
  //     condition: { subscriptionOrderId: subscriptionOrder.id },
  //     fields: WO_FIELDS_TO_SYNC_WITH_DISPATCH,
  //     orderByField: 'id',
  //     lastId: 1,
  //     count: 0,
  //     cb: async (items) => {
  //       await publishers.syncToDispatch(ctx, {
  //         schema: schemaName,
  //         userId,
  //         subscriptionWorkOrders: items,
  //         subscriptionWorkOrderDetails: serviceItemDetails,
  //       });
  //     },
  //   },
  //   trx,
  // );
  const subWO = await pricingGetBySubscriptionWorkOrder(ctx, {
    data: { subscriptionOrderId: subscriptionOrder.id },
  });
  const subscriptionWorkOrders = subWO.map(item => {
    const fieldsForSubWos = fpPick(WO_FIELDS_TO_SYNC_WITH_DISPATCH);
    return fieldsForSubWos(item);
  });

  await publishers.syncToDispatch(ctx, {
    schema: schemaName,
    userId,
    subscriptionWorkOrders,
    subscriptionWorkOrderDetails: serviceItemDetails,
  });

  // end of post-pricing service code
  ctx.logger.info(
    // eslint-disable-next-line max-len
    `Queued sync for "${subWO.length}" Subscription WOs of Subscription Order #${subscriptionOrder.id} (Subscription #${serviceItemDetails.subscriptionId})`,
  );
};

export const syncSubscriptionOrdersWosToDispatch = (ctx, { subscriptionOrders }, trx) =>
  Promise.all(
    subscriptionOrders.map(subscriptionOrder =>
      syncSubscriptionOrderWosToDispatch(ctx, { subscriptionOrder }, trx),
    ),
  );
