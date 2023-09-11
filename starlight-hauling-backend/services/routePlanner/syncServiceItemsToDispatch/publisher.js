import MqSender from '../../amqp/sender.js';
import { AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH } from '../../../config.js';
import { pricingGetSubscriptionServiceItemById } from '../../pricing.js';

const mqSender = MqSender.getInstance();

export const publisher = async (ctx, { serviceItems: serviceItemsRaw }) => {
  ctx.logger.debug(serviceItemsRaw, `syncServiceItemsToDispatch->publisher->deletedWorkOrders`);

  const ids = serviceItemsRaw.map(item => item.id);
  // pre-pricing service code:
  // const serviceItems = await subscriptionServiceItemsRepo.getAllPaginated({
  //   condition: { ids, serviceTypes: ['service'], resolveOriginalEntities: true },
  //   fields: ['*', 'subscription', 'material', 'jobSite', 'billableService', 'equipment'],
  // });
  const [serviceItems] = await Promise.all(
    serviceItemsRaw.map(item =>
      pricingGetSubscriptionServiceItemById(ctx, { data: { id: item.id } }),
    ),
  );

  await mqSender.sendTo(ctx, AMQP_QUEUE_SYNC_SUBSCRIPTION_SERVICE_ITEMS_TO_DISPATCH, {
    serviceItems,
  });

  ctx.logger.info(`Queued sync of "${ids.length}" syncServiceItemsToDispatch to Dispatch`);
};
