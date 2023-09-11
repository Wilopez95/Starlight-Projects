import SubscriptionServiceItemRepo from '../../../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import { ITEMS_PER_PAGE } from '../../../../consts/limits.js';

import { getAllServiceItemsStream } from '../../../../services/subscriptionServiceItems/getAllServiceItemsStream.js';

export const getSubscriptionServiceItemById = async ctx => {
  const { id } = ctx.params;

  const item = await SubscriptionServiceItemRepo.getInstance(ctx.state).getById({
    id,
  });

  ctx.sendObj(item);
};

export const getSubscriptionServiceItems = async ctx => {
  const { skip = 0, limit = ITEMS_PER_PAGE, ...condition } = ctx.request.validated.query;

  const items = await SubscriptionServiceItemRepo.getInstance(ctx.state).getAllPaginated({
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    condition,
    fields: ['*', 'subscription', 'material', 'jobSite', 'billableService', 'equipment'],
  });

  ctx.sendArray(items);
};

export const getAllSubscriptionServiceItemsStream = async ctx => {
  const options = ctx.request.validated.query;
  const stream = await getAllServiceItemsStream(ctx, options);

  ctx.body = stream;
};
