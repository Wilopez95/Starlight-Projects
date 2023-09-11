import isEmpty from 'lodash/isEmpty.js';

import knex from '../../db/connection.js';

import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import DraftSubscriptionRepo from '../../repos/subscription/draftSubscription.js';

import { publishers } from '../ordersGeneration/publishers.js';
import { proceedSubscriptionServiceItems } from '../subscriptionServiceItems/proceedSubscriptionServiceItems.js';
import { publishers as routePlannerPuplishers } from '../routePlanner/publishers.js';
import { pricingAlterSubscriptions } from '../pricing.js';
import { initSubscriptionDates } from './utils/initSubscriptionDates.js';
import { getSubscriptionDependencies } from './getSubscriptionDependencies.js';
import { prepHistoricalAndComputedFields } from './prepHistoricalAndComputedFields.js';
import { validateCreditLimit } from './utils/validateCreditLimit.js';

// pre-pricing service code: https://d.pr/i/JkkWz4
export const transferDaftSubscriptionToActive = async (ctx, { id, data, availableCredit } = {}) => {
  const draftSubscriptionRepo = DraftSubscriptionRepo.getInstance(ctx.state);
  const subsServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);

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

    const {
      serviceItems: serviceItemsInput,
      historicalIdsMap,
      originalIdsMap,
      ...insertData
    } = await prepHistoricalAndComputedFields(
      trx,
      ctx.state.user.schemaName,
      // pre-pricing service code:
      // DraftSubscriptionRepo.getHistoricalTableName,
      DraftSubscriptionRepo.getTableName,
      {
        data,
        linkedPair,
      },
    );

    ctx.logger.debug(`transferDaftSubscriptionToActive->availableCredit: ${availableCredit}`);

    validateCreditLimit(insertData, availableCredit);

    insertData.customerId = data.customerId;

    subscription = await pricingAlterSubscriptions(ctx, { data: insertData }, id);

    ctx.logger.debug(subscription, 'transferDaftSubscriptionToActive->subscription');

    const { today, tomorrow, subscriptionEndDate, firstOrderDate } =
      initSubscriptionDates(subscription);

    const { subscriptionBillableServicesMap, oneTimeBillableServicesMap } =
      await subsServiceItemRepo.collectSubscriptionBillableServices(serviceItemsInput);

    ctx.logger.debug(
      subscriptionBillableServicesMap,
      'transferDaftSubscriptionToActive->subscriptionBillableServicesMap',
    );
    ctx.logger.debug(
      oneTimeBillableServicesMap,
      'transferDaftSubscriptionToActive->oneTimeBillableServicesMap',
    );

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
    // pre-pricing service code:
    // ctx.logger.debug(subscription, 'transferDaftSubscriptionToActive->subscription');

    // const { today, tomorrow, subscriptionEndDate, firstOrderDate } =
    //   initSubscriptionDates(subscription);

    // const { subscriptionBillableServicesMap, oneTimeBillableServicesMap } =
    //   await subsServiceItemRepo.collectSubscriptionBillableServices(serviceItemsInput);

    // ctx.logger.debug(
    //   subscriptionBillableServicesMap,
    //   'transferDaftSubscriptionToActive->subscriptionBillableServicesMap',
    // );
    // ctx.logger.debug(
    //   oneTimeBillableServicesMap,
    //   'transferDaftSubscriptionToActive->oneTimeBillableServicesMap',
    ctx.logger.debug(
      subscriptionRecurringOrdersTemplates,
      'transferDaftSubscriptionToActive->subscriptionRecurringOrdersTemplates',
    );
    ctx.logger.debug(
      subscriptionOneTimeWorkOrdersTemplates,
      'transferDaftSubscriptionToActive->subscriptionOneTimeWorkOrdersTemplates',
    );
    subscription.oneTimeOrdersIds = oneTimeOrdersIds;
    subscription.oneTimeOrdersSequenceIds = oneTimeOrdersSequenceIds;
    // pre-pricing service code:
    // const {
    //   subscriptionRecurringOrdersTemplates,
    //   subscriptionOneTimeWorkOrdersTemplates,
    //   oneTimeOrdersIds,
    //   serviceItems,
    // } = await proceedSubscriptionServiceItems(
    //   ctx,
    //   {
    //     serviceItemsInput,
    //     subscription: {
    //       ...subscription,
    //       signatureRequired: linkedPair.signatureRequired,
    //       alleyPlacement: linkedPair.alleyPlacement,
    //       permitRequired: linkedPair.permitRequired,
    //       poRequired: linkedPair.poRequired,
    //     },
    //     firstOrderDate,
    //     subscriptionEndDate,
    //     today,
    //     tomorrow,
    //     subscriptionBillableServicesMap,
    //     oneTimeBillableServicesMap,
    //     originalIdsMap,
    //   },
    //   trx,
    // );

    // ctx.logger.debug(
    //   subscriptionRecurringOrdersTemplates,
    //   'transferDaftSubscriptionToActive->subscriptionRecurringOrdersTemplates',
    // );
    // ctx.logger.debug(
    //   subscriptionOneTimeWorkOrdersTemplates,
    //   'transferDaftSubscriptionToActive->subscriptionOneTimeWorkOrdersTemplates',
    // );
    // subscription.oneTimeOrdersIds = oneTimeOrdersIds ?? [];

    // await subsServiceItemRepo.initStubData({ data, subscriptionId: subscription.id }, trx);
    await subsServiceItemRepo.initStubData({ data, subscriptionId: subscription.id }, trx, ctx);

    await draftSubscriptionRepo.updateServiceFrequencyDescription(
      {
        id: subscription.id,
      },
      trx,
    );

    await trx.commit();

    const promises = [];

    if (!isEmpty(subscriptionRecurringOrdersTemplates)) {
      promises.push(
        publishers.generateSubscriptionOrders(ctx, {
          templates: subscriptionRecurringOrdersTemplates,
        }),
      );
    }
    if (!isEmpty(subscriptionOneTimeWorkOrdersTemplates)) {
      promises.push(
        publishers.generateSubscriptionWorkOrders(ctx, {
          templates: subscriptionOneTimeWorkOrdersTemplates,
        }),
      );
    }

    if (!isEmpty(serviceItems)) {
      promises.push(routePlannerPuplishers.syncServiceItemsToDispatch(ctx, { serviceItems }));
    }

    await Promise.all(promises);
  } catch (err) {
    await trx.rollback();

    throw err;
  }

  if (!subscription.oneTimeOrdersIds) {
    subscription.oneTimeOrdersIds = [];
    subscription.oneTimeOrdersSequenceIds = [];
  }

  return subscription;
};
