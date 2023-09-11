import isEmpty from 'lodash/isEmpty.js';

import knex from '../../db/connection.js';

import CustomerRepo from '../../repos/customer.js';
import PurchaseOrderRepo from '../../repos/purchaseOrder.js';
import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { proceedSubscriptionServiceItems } from '../subscriptionServiceItems/proceedSubscriptionServiceItems.js';
import { publishers } from '../ordersGeneration/publishers.js';
import { publishers as routePlannerPuplishers } from '../routePlanner/publishers.js';

import ApiError from '../../errors/ApiError.js';

import { LEVEL_APPLIED } from '../../consts/purchaseOrder.js';
import { CUSTOMER_STATUS } from '../../consts/customerStatuses.js';
import { pricingAddSubscriptions, pricingDeleteSubscriptions } from '../pricing.js';
import { validateCreditLimit } from './utils/validateCreditLimit.js';
import { prepHistoricalAndComputedFields } from './prepHistoricalAndComputedFields.js';
import { getSubscriptionDependencies } from './getSubscriptionDependencies.js';
import { initSubscriptionDates } from './utils/initSubscriptionDates.js';

export const createSubscription = async (ctx, { data, availableCredit, log } = {}) => {
  const customer = await CustomerRepo.getInstance(ctx.state).getBy({
    condition: { id: data.customerId },
    fields: ['status', 'customerGroupId'],
  });

  const { customerGroupId } = customer;

  if (customer?.status === CUSTOMER_STATUS.inactive) {
    throw ApiError.invalidRequest('Customer is inactive');
  }

  const subsServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);

  const trx = await knex.transaction();

  let subscription;
  try {
    const { linkedPair } = await getSubscriptionDependencies(
      ctx.state,
      {
        data,
      },
      trx,
    );

    if (linkedPair) {
      data.customerJobSiteId = linkedPair.id;
    }
    const {
      serviceItems: serviceItemsInput,
      historicalIdsMap,
      originalIdsMap,
      ...insertData
    } = await prepHistoricalAndComputedFields(
      trx,
      ctx.state.user.schemaName,
      SubscriptionRepo.getHistoricalTableName,
      {
        data,
        linkedPair,
      },
    );

    ctx.logger.debug(`subsRepo->create->availableCredit: ${availableCredit}`);

    validateCreditLimit(insertData, availableCredit);

    // Create subscription and set IDs to latest historical records.
    // Create subscriptions int he new princing backend.

    insertData.customerId = data.customerId;
    insertData.customerGroupId = customerGroupId;

    subscription = await pricingAddSubscriptions(ctx, { data: insertData });

    ctx.logger.debug(subscription, 'subsRepo->create->subscription');

    const { today, tomorrow, subscriptionEndDate, firstOrderDate } =
      initSubscriptionDates(subscription);

    const { subscriptionBillableServicesMap, oneTimeBillableServicesMap } =
      await subsServiceItemRepo.collectSubscriptionBillableServices(serviceItemsInput);
    ctx.logger.debug(
      subscriptionBillableServicesMap,
      'subsRepo->create->subscriptionBillableServicesMap',
    );
    ctx.logger.debug(oneTimeBillableServicesMap, 'subsRepo->create->oneTimeBillableServicesMap');

    const {
      subscriptionRecurringOrdersTemplates,
      subscriptionOneTimeWorkOrdersTemplates,
      oneTimeOrdersIds,
      oneTimeOrdersSequenceIds,
      serviceItems,
    } = await proceedSubscriptionServiceItems(
      ctx,
      {
        serviceItemsInput,
        subscription: {
          ...subscription,
          signatureRequired: linkedPair.signatureRequired,
          alleyPlacement: linkedPair.alleyPlacement,
          permitRequired: linkedPair.permitRequired,
          poRequired: linkedPair.poRequired,
        },
        firstOrderDate,
        subscriptionEndDate,
        today,
        tomorrow,
        subscriptionBillableServicesMap,
        oneTimeBillableServicesMap,
        originalIdsMap,
      },
      trx,
    );

    ctx.logger.debug(
      subscriptionRecurringOrdersTemplates,
      'subsRepo->create->subscriptionRecurringOrdersTemplates',
    );
    ctx.logger.debug(
      subscriptionOneTimeWorkOrdersTemplates,
      'subsRepo->create->subscriptionOneTimeWorkOrdersTemplates',
    );
    subscription.oneTimeOrdersIds = oneTimeOrdersIds;

    subscription.oneTimeOrdersSequenceIds = oneTimeOrdersSequenceIds;

    await subsServiceItemRepo.initStubData({ data, subscriptionId: subscription.id }, trx, ctx);
    await subscriptionRepo.updateServiceFrequencyDescription(
      {
        id: subscription.id,
      },
      ctx,
    );
    if (subscription.purchaseOrderId) {
      await PurchaseOrderRepo.getInstance(ctx.state).applyLevelAppliedValue(
        {
          id: subscription.purchaseOrderId,
          applicationLevel: LEVEL_APPLIED.subscription,
        },
        trx,
      );
    }

    await trx.commit();

    if (!isEmpty(subscriptionRecurringOrdersTemplates)) {
      await publishers.generateSubscriptionOrders(ctx, {
        templates: subscriptionRecurringOrdersTemplates,
      });
    }

    if (!isEmpty(subscriptionOneTimeWorkOrdersTemplates)) {
      await publishers.generateSubscriptionWorkOrders(ctx, {
        templates: subscriptionOneTimeWorkOrdersTemplates,
      });
    }
    if (!isEmpty(serviceItems)) {
      await routePlannerPuplishers.syncServiceItemsToDispatch(ctx, { serviceItems });
    }

    if (log) {
      const subsOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);

      !isEmpty(subscriptionOneTimeWorkOrdersTemplates) &&
        subscriptionOneTimeWorkOrdersTemplates.forEach(({ subscriptionOrderId }) => {
          subsOrderRepo.log({
            id: subscriptionOrderId,
            action: subscriptionRepo.logAction.create,
            entity: subscriptionRepo.logEntity.subscription_orders,
          });
        });
    }
  } catch (err) {
    if (subscription?.id) {
      await pricingDeleteSubscriptions(ctx, subscription.id);
    }
    await trx.rollback();

    throw err;
  }
  if (!subscription.oneTimeOrdersIds) {
    subscription.oneTimeOrdersIds = [];
    subscription.oneTimeOrdersSequenceIds = [];
  }

  return subscription;
};
