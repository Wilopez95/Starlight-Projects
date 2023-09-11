import httpStatus from 'http-status';
import isEmpty from 'lodash/fp/isEmpty.js';
import pick from 'lodash/fp/pick.js';

import SubscriptionRepo from '../../../repos/subscription/subscription.js';
import SubscriptionWorkOrdersRepo from '../../../repos/subscriptionWorkOrder.js';
import SubscriptionOrderRepo from '../../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionServiceItemRepo from '../../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionHistoryRepo from '../../../repos/subscriptionHistory.js';

import { getAvailableCredit } from '../../../services/billing.js';
import { subscriptionHistoryEmitter } from '../../../services/subscriptionHistory/emitter.js';
import calculateSubscriptionPricesService from '../../../services/pricesCalculation/subscription/calculatePrices.js';
import { subscriptionsIndexingEmitter } from '../../../services/subscriptions/subscriptionsIndexingEmitter.js';
import { createSubscription } from '../../../services/subscriptions/createSubscription.js';
import { updateSubscription } from '../../../services/subscriptions/updateSubscription.js';
import { applyProrationChange } from '../../../services/subscriptions/applyProrationChange.js';
import { putOnHold } from '../../../services/subscriptions/putOnHold.js';
import { putOffHold } from '../../../services/subscriptions/putOffHold.js';
import { recalculateSubscriptionSummaryProration } from '../../../services/subscriptions/recalculateSubscriptionSummaryProration.js';
import { recalculateSubscriptionSummary } from '../../../services/subscriptions/recalculateSubscriptionSummary.js';

import { parseSearchQuery } from '../../../utils/search.js';

import { SORT_ORDER } from '../../../consts/sortOrders.js';
import { SUBSCRIPTION_STATUS } from '../../../consts/subscriptionStatuses.js';
import { SUBSCRIPTION_ORDERS_PER_PAGE } from '../../../consts/limits.js';
import { SUBSCRIPTION_WORK_ORDER_SORTING_ATTRIBUTE } from '../../../consts/orderSortingAttributes.js';
import {
  SUBSCRIPTIONS_DEFAULT_SORTING,
  SUBSCRIPTION_ORDERS_DEFAULT_SORTING,
} from '../../../consts/subscriptionAttributes.js';
import { PAYMENT_METHOD } from '../../../consts/paymentMethods.js';
import { SUBSCRIPTION_INDEXING_ACTION } from '../../../consts/subscriptionsIndexingActions.js';

const ITEMS_PER_PAGE = 25;

export const getSubscriptionsPaginated = async ctx => {
  const { email } = ctx.state.user;
  const {
    skip = 0,
    limit = ITEMS_PER_PAGE,
    mine,
    sortBy = SUBSCRIPTIONS_DEFAULT_SORTING,
    sortOrder = SORT_ORDER.asc,
    ...filters
  } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  if (mine) {
    condition.csrEmail = email;
  }
  Object.assign(condition, filters);

  const subscriptions = await SubscriptionRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(subscriptions);
};

export const getSubscriptionsCount = async ctx => {
  const { email } = ctx.state.user;
  const { mine, customerId } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  if (mine) {
    condition.csrEmail = email;
  }
  if (customerId) {
    condition.customerId = customerId;
  }

  const subsCount = await SubscriptionRepo.getInstance(ctx.state).count({ condition });

  ctx.sendObj(subsCount);
};

export const addSubscription = async ctx => {
  const { email } = ctx.state.user;
  const data = ctx.request.validated.body;
  data.csrEmail = email;
  data.paymentMethod = PAYMENT_METHOD.onAccount;

  const { availableCredit } = await getAvailableCredit(ctx, {
    customerId: data.customerId,
  });

  const subscription = await createSubscription(ctx, {
    data,
    availableCredit,
    log: true,
  });

  subscriptionHistoryEmitter.emit('subscriptionCreated', ctx.state, subscription.id);
  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.create, ctx, subscription.id);

  ctx.status = httpStatus.CREATED;
  ctx.body = pick(['id', 'oneTimeOrdersSequenceIds'])(subscription);
};

export const editSubscriptionById = async ctx => {
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;
  const { id } = ctx.params;

  const { availableCredit } = await getAvailableCredit(ctx, {
    customerId: data.customerId,
  });

  delete data.customerId;

  await updateSubscription(ctx, {
    condition: { id },
    concurrentData,
    data,
    availableCredit,
    log: true,
  });

  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateOne, ctx, id);

  ctx.status = httpStatus.OK;
};

export const recalculateSubscription = async ctx => {
  const { id } = ctx.params;
  const { serviceItems, lineItems } = ctx.request.validated.body;

  const summary = await recalculateSubscriptionSummary(ctx, {
    id,
    serviceItems,
    lineItems,
  });

  ctx.sendObj(summary);
};

export const recalculateSubscriptionProration = async ctx => {
  const { body } = ctx.request.validated;
  const summary = await recalculateSubscriptionSummaryProration(ctx, body);

  ctx.sendObj(summary);
};

export const calculatePrices = async ctx => {
  const { body } = ctx.request.validated;
  const prices = await calculateSubscriptionPricesService(ctx, body);

  ctx.sendObj(prices);
};

export const getSubscriptionById = async ctx => {
  const { id } = ctx.params;

  const { customerId } = ctx.request.validated.query;
  const condition = {};
  if (customerId) {
    condition.customerId = customerId;
  }

  const subscription = await SubscriptionRepo.getInstance(ctx.state).getByIdPopulated({
    id,
    condition,
  });

  ctx.sendObj(subscription);
};

export const getSubscriptionHistory = async ctx => {
  const { subscriptionId } = ctx.params;

  const subscription = await SubscriptionHistoryRepo.getInstance(ctx.state).getAll({
    condition: {
      subscriptionId,
    },
  });

  ctx.sendObj(subscription);
};

export const getSubscriptionsTotalForCurrentPeriod = async ctx => {
  const { schemaName, customerId } = ctx.request.validated.query;
  const subscriptionRepo = SubscriptionRepo.getInstance(ctx.state, {
    schemaName,
  });
  const subOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state, {
    schemaName,
  });

  const [subsTotalForCurrentPeriod, subsTotalPaid, notInvoicedSubsOrdersTotal] = await Promise.all([
    subscriptionRepo.getSumCurrentSubscriptionPrice({
      condition: {
        customerId,
      },
    }),
    subscriptionRepo.getSumPaid({
      condition: { customerId, status: SUBSCRIPTION_STATUS.active },
    }),
    subOrderRepo.getSumNotInvoicedTotal({ customerId }),
  ]);

  ctx.sendObj({ subsTotalForCurrentPeriod, subsTotalPaid, notInvoicedSubsOrdersTotal });
};
export const getSubscriptionOrders = async ctx => {
  const { subscriptionId } = ctx.params;

  const {
    skip = 0,
    limit = SUBSCRIPTION_ORDERS_PER_PAGE,
    sortBy = SUBSCRIPTION_ORDERS_DEFAULT_SORTING,
    sortOrder = SORT_ORDER.desc,
    ...condition
  } = ctx.request.validated.query;

  condition.subscriptionId = subscriptionId;

  const orders = await SubscriptionOrderRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), SUBSCRIPTION_ORDERS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(orders);
};

export const getSubscriptionServiceItems = async ctx => {
  const { subscriptionId } = ctx.params;

  const { skip = 0, limit = ITEMS_PER_PAGE, ...condition } = ctx.request.validated.query;

  condition.subscriptionId = subscriptionId;

  const orders = await SubscriptionServiceItemRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
  });

  ctx.sendArray(orders);
};

export const getSubscriptionOrderWorkOrders = async ctx => {
  const { subscriptionOrderId } = ctx.params;

  const {
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortBy = SUBSCRIPTION_WORK_ORDER_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
    ...condition
  } = ctx.request.validated.query;

  condition.subscriptionOrderId = subscriptionOrderId;

  const workOrders = await SubscriptionWorkOrdersRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(workOrders);
};

export const searchSubscriptions = async ctx => {
  const {
    query,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    customerId,
    ...filters
  } = ctx.request.validated.query;
  const subscriptions = [];

  const { searchId, searchQuery } = parseSearchQuery(query);

  const repo = SubscriptionRepo.getInstance(ctx.state);
  const condition = ctx.getRequestCondition();

  if (customerId) {
    condition.customerId = customerId;
  }

  const search = [
    repo.getAllPaginated({
      condition: { ...condition, ...filters, jobSite: searchQuery },
      skip: Number(skip),
      limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    }),
    repo.getAllPaginated({
      condition: { ...condition, ...filters, customerName: searchQuery },
      skip: Number(skip),
      limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    }),
  ];

  if (searchId) {
    search.push(repo.getAllPaginated({ condition: { id: searchId, ...filters } }));
  }

  const result = await Promise.all(search);

  result.forEach(item => {
    if (Array.isArray(item)) {
      return subscriptions.push(...item);
    }
    return !isEmpty(item) ? subscriptions.push(item) : true;
  });

  ctx.sendArray(subscriptions);
};

export const createSubscriptionOrder = async ctx => {
  const data = ctx.request.validated.body;
  const { subscriptionId } = ctx.params;

  data.subscriptionId = subscriptionId;

  // TODO: remove this if condition after merged FE
  let availableCredit = Number.MAX_VALUE;
  if (data.customerId) {
    const availableCreditInfo = await getAvailableCredit(ctx, {
      customerId: data.customerId,
    });
    ({ availableCredit } = availableCreditInfo);
  }

  const subscriptionOrder = await SubscriptionOrderRepo.getInstance(ctx.state).createOne({
    data,
    availableCredit,
    fields: ['*'],
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = subscriptionOrder;
};

export const onHoldSubscription = async ctx => {
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;
  const { subscriptionId } = ctx.params;

  if (!data.updateOnly) {
    data.status = SUBSCRIPTION_STATUS.onHold;
  }
  delete data.updateOnly;

  await putOnHold(ctx, {
    condition: { subscriptionId },
    data,
    concurrentData,
  });

  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateOne, ctx, subscriptionId);

  ctx.status = httpStatus.OK;
};

export const offHoldSubscription = async ctx => {
  const { concurrentData } = ctx.state;
  const { subscriptionId } = ctx.params;

  await putOffHold(ctx, {
    condition: { subscriptionId },
    data: {
      status: SUBSCRIPTION_STATUS.active,
      reason: null,
      reasonDescription: null,
    },
    concurrentData,
  });

  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateOne, ctx, subscriptionId);

  ctx.status = httpStatus.OK;
};

export const getAvailableFilters = async ctx => {
  const filters = await SubscriptionRepo.getInstance(ctx.state).getAvailableFilters();
  ctx.sendObj(filters);
};

export const prorationChangeApply = async ctx => {
  const { body: data } = ctx.request.validated;
  const { id } = ctx.params;

  await applyProrationChange(ctx, data);

  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateOne, ctx, id);

  ctx.status = httpStatus.OK;
};
