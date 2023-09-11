import isEmpty from 'lodash/isEmpty.js';
// import camelCase from 'lodash/fp/camelCase.js';

import knex from '../../db/connection.js';

import { proccedWorkOrdersTemplate } from '../subscriptionServiceItems/proccedWorkOrdersTemplate.js';
import { publishers } from '../ordersGeneration/publishers.js';
import { pricingAlterSubscriptions, pricingGetSubscriptionServiceItemById } from '../pricing.js';
import { validateExists } from './utils/validateExists.js';

export const putOffHold = async (
  ctx,
  { condition: { subscriptionId }, updatedSubscription, data /* pre-pricing: concurrentData */ },
  trx,
) => {
  const _trx = trx || (await knex.transaction());

  let subscription = updatedSubscription;

  data.onHoldEmailSent = false;
  data.onHoldNotifyMainContact = false;
  data.onHoldNotifySalesRep = false;

  try {
    if (!subscription) {
      // ToDo: Modify this endpoint to save the information into the pricing backend
      // By: Esteban Navarro | Ticket: PS-231 | Date: 01/10/2022
      // Done
      subscription = await pricingAlterSubscriptions(ctx, { data }, subscriptionId);
    }

    validateExists(subscription);

    ctx.logger.debug(subscription, 'subsRepo-putOffHold->subscription');

    // ToDo: Modify this endpoint to take information from the pricing backend
    // By: Esteban Navarro | Ticket: PS-231 | Date: 01/10/2022
    // Done

    const serviceItems = await pricingGetSubscriptionServiceItemById(ctx, {
      data: { id: subscriptionId },
    });
    // const serviceItems = await subsServiceItemRepo.getBySubscriptionId({ subscriptionId }, _trx);

    const { subscriptionRecurringOrdersTemplates, subscriptionOneTimeWorkOrdersTemplates } =
      await proccedWorkOrdersTemplate(ctx, { subscription, serviceItems, skipOneTime: true }, _trx);

    if (!trx) {
      await _trx.commit();
    }

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

    ctx.logger.debug(
      subscriptionRecurringOrdersTemplates,
      'subsRepo->putOffHold->subscriptionRecurringOrdersTemplates',
    );
    ctx.logger.debug(
      subscriptionOneTimeWorkOrdersTemplates,
      'subsRepo->putOffHold->subscriptionOneTimeWorkOrdersTemplates',
    );
  } catch (error) {
    if (!trx) {
      await _trx.rollback();
    }
    throw error;
  }
};
