import {
  getHaulingSubscriptionsDraftsCount,
  getHaulingSubscriptionsDrafts,
  getHaulingSubscriptionDraftById,
  searchHaulingSubscriptionDrafts,
} from '../../../../services/hauling/subscriptions.js';

export const getSubscriptionsDraftsCount = async (ctx) => {
  const data = await getHaulingSubscriptionsDraftsCount(ctx);
  ctx.sendObj(data);
};

export const getSubscriptionsDrafts = async (ctx) => {
  const data = await getHaulingSubscriptionsDrafts(ctx);
  ctx.sendArray(data);
};

export const getSubscriptionDraftById = async (ctx) => {
  const data = await getHaulingSubscriptionDraftById(ctx);
  ctx.sendObj(data);
};

export const searchSubscriptionDrafts = async (ctx) => {
  const data = await searchHaulingSubscriptionDrafts(ctx);
  ctx.sendObj(data);
};
