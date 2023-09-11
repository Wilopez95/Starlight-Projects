import SubscriptionOrderRepo from '../../../../repos/subscriptionOrder/subscriptionOrder.js';

import { getAvailableCredit } from '../../../../services/billing.js';
import { updateBasedOnSnapshot } from '../../../../services/subscriptionOrders/updateBasedOnSnapshot.js';
import { updateSubscriptionOrdersSummary } from '../../../../services/subscriptionOrders/updateSubscriptionOrdersSummary.js';

import { parseSearchQuery } from '../../../../utils/search.js';
import knex from '../../../../db/connection.js';

import { SORT_ORDER } from '../../../../consts/sortOrders.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../../../consts/orderStatuses.js';

import { publishers as routePlannerPuplishers } from '../../../../services/routePlanner/publishers.js';
import calculateSubscriptionOrderPricesService from '../../../../services/pricesCalculation/subscriptionOrder/calculatePrices.js';
import { subscriptionsIndexingEmitter } from '../../../../services/subscriptions/subscriptionsIndexingEmitter.js';
import { SUBSCRIPTION_INDEXING_ACTION } from '../../../../consts/subscriptionsIndexingActions.js';
import { groupByServiceItem } from '../../../../services/subscriptions/groupByServiceItem.js';

import {
  pricingGetSubscriptionById,
  pricingGetSubscriptionOrdersCount,
  pricingGetSubscriptionsOrders,
  pricingValidateSubscriptionOrder,
} from '../../../../services/pricing.js';

const ITEMS_PER_PAGE = 25;

export const getSubscriptionOrderById = async ctx => {
  const { id } = ctx.params;
  const { isCompletion, completed } = ctx.request.validated.query;

  const subscriptionOrder = await SubscriptionOrderRepo.getInstance(ctx.state).getById({
    id,
    isCompletion,
    completed,
  });

  ctx.sendObj(subscriptionOrder);
};

export const editSubscriptionOrderById = async ctx => {
  const data = ctx.request.validated.body;
  const { id } = ctx.params;
  const { subscriptionId } = ctx.request.validated.body;

  const trx = await knex.transaction();
  let subscriptionOrder;
  const deletedWorkOrders = [];
  const updatedWorkOrders = [];
  try {
    // TODO: remove this if condition after merged FE
    let availableCredit = Number.MAX_VALUE;
    if (data.customerId) {
      const availableCreditInfo = await getAvailableCredit(ctx, {
        customerId: data.customerId,
      });
      ({ availableCredit } = availableCreditInfo);
    }

    const subscription = await pricingGetSubscriptionById(ctx, {
      id: subscriptionId,
      customerId: data.customerId,
    });
    const { unlockOverrides, customRatesGroupId, ...updates } = data;
    subscriptionOrder = await updateBasedOnSnapshot(
      ctx,
      {
        subscription,
        id,
        unlockOverrides,
        availableCredit,
        customRatesGroupId: customRatesGroupId || null,
        deletedWorkOrders,
        updatedWorkOrders,
        ...updates,
      },
      trx,
    );
    await trx.commit();
    const subsOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);
    subsOrderRepo.log({ id, action: subsOrderRepo.logAction.modify });

    if (deletedWorkOrders.length) {
      await routePlannerPuplishers.syncDeleteWosToDispatch(
        { state: ctx.state, logger: ctx.state.logger },
        {
          isIndependent: false,
          deletedWorkOrders,
        },
      );
    }
    if (updatedWorkOrders.length) {
      const dataForSync = await groupByServiceItem(updatedWorkOrders, {
        state: ctx.state,
      });

      await Promise.all(
        dataForSync.map(items =>
          routePlannerPuplishers.syncToDispatch(ctx, {
            schema: ctx.state.user.schemaName,
            userId: ctx.state.user.userId,
            ...items,
          }),
        ),
      );
    }
  } catch (error) {
    await trx.rollback();

    throw error;
  }

  subscriptionsIndexingEmitter.emit(
    SUBSCRIPTION_INDEXING_ACTION.updateOne,
    ctx,
    subscriptionOrder.subscriptionId,
  );

  ctx.sendObj(subscriptionOrder);
};

export const getSubscriptionsOrders = async ctx => {
  const {
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortBy,
    sortOrder = SORT_ORDER.asc,
    query,
    ...condition
  } = ctx.request.validated.query;

  Object.assign(condition, parseSearchQuery(query));

  condition.omitDraft = true;

  const orders = await pricingGetSubscriptionsOrders(ctx, {
    data: {
      condition,
      skip,
      limit,
      sortBy,
      sortOrder,
      ...condition,
    },
  });

  ctx.sendArray(orders);
};

export const getSubscriptionOrdersCount = async ctx => {
  const { customerId, businessUnitId } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();

  if (customerId) {
    condition.customerId = customerId;
  }

  if (businessUnitId) {
    condition.businessUnitId = businessUnitId;
  }

  const total = await pricingGetSubscriptionOrdersCount(ctx, {
    data: { ...condition },
  });

  ctx.sendObj(total);
};

export const validateOrders = async ctx => {
  const { ids, businessUnitId, status } = ctx.request.validated.body;
  const subOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);

  const condition = {
    status,
  };

  const invalidOrders = await subOrderRepo.getInvalidOrders({
    condition,
    businessUnitId,
    ids,
    fields: ['id'],
  });

  ctx.sendObj({ invalidOrdersTotal: invalidOrders.length });
};

export const batchUpdate = async ctx => {
  const { ids, businessUnitId, status, validOnly } = ctx.request.validated.body;

  const subOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);

  let initialStatus;

  if (status === SUBSCRIPTION_ORDER_STATUS.approved) {
    initialStatus = SUBSCRIPTION_ORDER_STATUS.needsApproval;
  } else if (status === SUBSCRIPTION_ORDER_STATUS.finalized) {
    initialStatus = SUBSCRIPTION_ORDER_STATUS.approved;
  } else if (status === SUBSCRIPTION_ORDER_STATUS.inProgress) {
    initialStatus = SUBSCRIPTION_ORDER_STATUS.scheduled;
  }

  const condition = {
    status: initialStatus,
  };

  let excludeIds = [];

  if (validOnly) {
    const invalidOrders = await pricingValidateSubscriptionOrder(ctx, {
      data: { businessUnitId, ids, status: initialStatus },
    });
    excludeIds = invalidOrders.map(item => item.id);
  }

  const trx = await knex.transaction();
  let subscriptionOrders;
  try {
    subscriptionOrders = await subOrderRepo.batchUpdate(
      {
        condition,
        data: { status },
        businessUnitId,
        ids,
        excludeIds,
        log: true,
      },
      trx,
    );

    if (subscriptionOrders?.length) {
      await updateSubscriptionOrdersSummary(
        ctx,
        {
          syncToRoutePlanner: true,
          subscriptionOrders,
        },
        trx,
      );
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback();

    throw error;
  }

  const subscriptionsIds = subscriptionOrders.map(sub => sub.subscriptionId);

  subscriptionsIndexingEmitter.emit(SUBSCRIPTION_INDEXING_ACTION.updateMany, ctx, {
    ids: subscriptionsIds,
  });

  ctx.sendArray(subscriptionOrders);
};

export const calculatePrices = async ctx => {
  const { body } = ctx.request.validated;
  const prices = await calculateSubscriptionOrderPricesService(ctx, body);

  ctx.sendObj(prices);
};
