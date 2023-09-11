import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';

import SubscriptionRepo from '../../../../repos/subscription/subscription.js';
import DraftSubscriptionsRepository from '../../../../repos/subscription/draftSubscription.js';

import * as billingService from '../../../../services/billing.js';
import { subscriptionsIndexingEmitter } from '../../../../services/subscriptions/subscriptionsIndexingEmitter.js';
import { createDraftSubscription } from '../../../../services/subscriptions/createDraftSubscription.js';
import { updateDraftSubscription } from '../../../../services/subscriptions/updateDraftSubscription.js';
import { transferDaftSubscriptionToActive } from '../../../../services/subscriptions/transferDaftSubscriptionToActive.js';
import { subscriptionHistoryEmitter } from '../../../../services/subscriptionHistory/emitter.js';

import { SUBSCRIPTION_HISTORY_EVENT } from '../../../../consts/subscriptionHistoryEvents.js';
import { SUBSCTIPTION_HISTORY_ENTITY_ACTION } from '../../../../consts/subscriptionHistoryEntityActions.js';
import { SUBSCRIPTION_INDEXING_ACTION } from '../../../../consts/subscriptionsIndexingActions.js';
import { SORT_ORDER } from '../../../../consts/sortOrders.js';
import { SUBSCRIPTIONS_DEFAULT_SORTING } from '../../../../consts/subscriptionAttributes.js';
import { PAYMENT_METHOD } from '../../../../consts/paymentMethods.js';
import { SUBSCRIPTION_STATUS } from '../../../../consts/subscriptionStatuses.js';

import {
  pricingGetSubscriptionsPaginated,
  pricingGetDraftSubscriptionById,
} from '../../../../services/pricing.js';

const ITEMS_PER_PAGE = 25;

export const getSubscriptionDraftsCount = async ctx => {
  const { email } = ctx.state.user;
  const { mine, customerId } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  if (mine) {
    condition.csrEmail = email;
  }
  if (customerId) {
    condition.customerId = customerId;
  }

  const subscriptionTotals = await SubscriptionRepo.getInstance(ctx.state).count({
    condition,
  });

  ctx.sendObj({ total: subscriptionTotals.statuses.draft });
};

export const getSubscriptionDraftsPaginated = async ctx => {
  const { email } = ctx.state.user;

  const {
    mine,
    customerId,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortBy = SUBSCRIPTIONS_DEFAULT_SORTING,
    sortOrder = SORT_ORDER.asc,
    ...filters
  } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();

  // Retrieve draft subscriptions
  condition.skip = skip;
  condition.limit = limit;
  condition.sortBy = sortBy;
  condition.sortOrder = sortOrder;
  condition.status = SUBSCRIPTION_STATUS.draft;
  if (mine) {
    condition.csrEmail = email;
  }
  if (customerId) {
    condition.customerId = customerId;
  }
  Object.assign(filters, condition);

  const drafts = await pricingGetSubscriptionsPaginated(ctx, { data: { ...filters } });

  ctx.sendArray(drafts);
};

export const addDraftSubscription = async ctx => {
  const { email } = ctx.state.user;
  const data = ctx.request.validated.body;
  data.csrEmail = email;
  data.paymentMethod = PAYMENT_METHOD.onAccount;

  const newDraft = await createDraftSubscription(ctx, {
    data,
  });

  subscriptionHistoryEmitter.emit(SUBSCRIPTION_HISTORY_EVENT.additionalAction, ctx.state, {
    entityAction: SUBSCTIPTION_HISTORY_ENTITY_ACTION.subscriptionDraftSaved,
    subscriptionId: newDraft.id,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = { id: newDraft.id };
};

export const editDraftSubscription = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const data = ctx.request.validated.body;
  if (data.thirdPartyHaulerId === 0) {
    data.thirdPartyHaulerId = null;
  }

  await updateDraftSubscription(ctx, {
    condition: { id },
    concurrentData,
    data,
  });

  ctx.status = httpStatus.OK;
};

export const getSubscriptionDraftById = async ctx => {
  const { id } = ctx.params;
  const payloadData = { id };

  const subscription = await pricingGetDraftSubscriptionById(ctx, payloadData);

  ctx.sendObj(subscription);
};

export const deleteDraftSubscription = async ctx => {
  const { id } = ctx.params;

  await SubscriptionRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const searchSubscriptionDrafts = async ctx => {
  const {
    query,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    customerId,
    ...filters
  } = ctx.request.validated.query;
  const subscriptionsDrafts = [];

  const repo = SubscriptionRepo.getInstance(ctx.state);
  const condition = ctx.getRequestCondition();

  condition.status = SUBSCRIPTION_STATUS.draft;

  const search = [
    repo.getBy({
      condition: { ...condition, ...filters, jobSite: query, customerId },
      skip: Number(skip),
      limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    }),
    repo.getBy({
      condition: { ...condition, ...filters, customerName: query, customerId },
      skip: Number(skip),
      limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    }),
  ];

  const id = Number.parseInt(query, 10);
  if (id && !Number.isNaN(id)) {
    search.push(
      DraftSubscriptionsRepository.getInstance(ctx.state).getByIdPopulated({
        id,
      }),
    );
  }

  const result = await Promise.all(search);

  result.forEach(item => {
    if (Array.isArray(item)) {
      return subscriptionsDrafts.push(...item);
    }
    return item && subscriptionsDrafts.push(item);
  });

  ctx.sendArray(subscriptionsDrafts);
};

export const getAvailableFilters = async ctx => {
  const filters = await SubscriptionRepo.getInstance(ctx.state).getAvailableFilters();
  ctx.sendObj(filters);
};

export const updateToActive = async ctx => {
  const { id } = ctx.params;
  const { concurrentData } = ctx.state;
  const { email } = ctx.state.user;

  const data = ctx.request.validated.body;
  data.csrEmail = email;
  data.paymentMethod = PAYMENT_METHOD.onAccount;

  const { availableCredit } = await billingService.getAvailableCredit(ctx, {
    customerId: data.customerId,
  });

  const subscription = await transferDaftSubscriptionToActive(ctx, {
    id,
    data,
    concurrentData,
    availableCredit,
  });

  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateOne, ctx, id);

  ctx.status = httpStatus.OK;
  ctx.body = pick(['id', 'oneTimeOrdersSequenceIds'])(subscription);
};
