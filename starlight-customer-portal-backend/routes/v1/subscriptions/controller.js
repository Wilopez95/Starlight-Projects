import {
  getHaulingSubscriptionsCount,
  getHaulingSubscriptions,
  getHaulingSubscriptionById,
  searchHaulingSubscriptions,
} from '../../../services/hauling/subscriptions.js';

export const getSubscriptionsCount = async (ctx) => {
  const data = await getHaulingSubscriptionsCount(ctx);
  ctx.sendObj(data);
};

export const getSubscriptions = async (ctx) => {
  const data = await getHaulingSubscriptions(ctx);
  ctx.sendArray(data);
};

export const getSubscriptionById = async (ctx) => {
  const data = await getHaulingSubscriptionById(ctx);
  ctx.sendObj(data);
};

export const searchSubscriptions = async (ctx) => {
  const data = await searchHaulingSubscriptions(ctx);
  ctx.sendObj(data);
};
