import SubscriptionMediaRepository from '../../../../repos/subscriptionMedia.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../../../consts/orderStatuses.js';

export const getMediaFilesForInvoice = async ctx => {
  const { subscriptions } = ctx.request.validated.body;

  const subscriptionMedia = await SubscriptionMediaRepository.getInstance(
    ctx.state,
  ).getMediaFilesForInvoicing(subscriptions, [SUBSCRIPTION_ORDER_STATUS.invoiced]);

  ctx.sendArray(subscriptionMedia);
};
