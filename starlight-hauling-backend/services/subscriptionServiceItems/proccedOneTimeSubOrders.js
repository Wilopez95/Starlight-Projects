import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/fp/omit.js';
import _ from 'lodash';

import PurchaseOrderRepo from '../../repos/purchaseOrder.js';

import { canGenerateOrders } from '../subscriptions/utils/canGenerateOrders.js';

import { LEVEL_APPLIED } from '../../consts/purchaseOrder.js';
import {
  pricingBulkAddSubscriptionLineItem,
  pricingBulkAddSubscriptionOrder,
  pricingSequenceCount,
  pricingDeleteSubscriptionsOrders,
} from '../pricing.js';
import BillableServiceRepository from '../../repos/billableService.js';

export const proccedOneTimeSubOrders = async (
  ctx,
  ctxState,
  {
    serviceLineItemsPreparedInput,
    subsOneTimeOrdersPreparedInput,
    proceedSubsOrders,
    oneTimeOrdersIds,
    oneTimeOrdersSequenceIds,
    subscription,
  },
  trx,
) => {
  ctxState.logger.debug(
    serviceLineItemsPreparedInput,
    `
                    subsServiceItemRepo->proceedSubsServiceItems->serviceLineItemsPreparedInput
                `,
  );
  ctxState.logger.debug(
    subsOneTimeOrdersPreparedInput,
    `
                    subsServiceItemRepo->proceedSubsServiceItems->subsOneTimeOrdersPreparedInput
                `,
  );

  // Delete subscriptions_orders created when and subscription order is created for avoid duplicated orders

  let needToDelete = false;
  const subsOneTimeOrdersPreparedInput2 = await Promise.all(
    subsOneTimeOrdersPreparedInput.map(async order => {
      if (!order.billableService) {
        order.billableService = await BillableServiceRepository.getInstance(ctxState).getById({
          id: order.billableServiceId,
        });
      }
      if (order.billableService.action !== 'delivery' && order.billableService.action !== 'final') {
        needToDelete = true;
      }
      return order;
    }),
  );

  if (needToDelete) {
    await pricingDeleteSubscriptionsOrders(ctx, {
      data: { subscriptionId: subscription.id },
    });
  }

  // Get the count of subscriotions orders
  const sequenceId = await pricingSequenceCount(ctx, { data: { id: subscription.id } });

  const pricingSubscriptionOrders = await Promise.all([
    isEmpty(serviceLineItemsPreparedInput) || proceedSubsOrders
      ? []
      : // This is the origil code created by Eleks
        // : subscriptionLineItemRepo.insertMany({ data: serviceLineItemsPreparedInput }, trx),
        // Insert Many Subscription Line Items into te new pricing backend
        await pricingBulkAddSubscriptionLineItem(ctx, {
          data: {
            data: serviceLineItemsPreparedInput,
          },
        }),
    isEmpty(subsOneTimeOrdersPreparedInput2)
      ? []
      : // This is the origil code created by Eleks
        // : subsOrderRepo.insertMany(
        //     {
        //       subscriptionId: subscription.id,
        //       data: subsOneTimeOrdersPreparedInput,
        //       fields: [...subscriptionOrderFieldsForWos, 'sequenceId'],
        //     },
        //     trx,
        //   ),
        // Insert Many Subscription Orders into the new pricing Backend
        await pricingBulkAddSubscriptionOrder(ctx, {
          data: {
            data: subsOneTimeOrdersPreparedInput2.map((item, i) => ({
              ...item,
              subscriptionId: subscription.id,
              sequenceId: `${subscription.id}.${sequenceId + i + 1}`,
            })),
          },
        }),
  ]);
  const subscriptionOneTimeOrders = _.get(pricingSubscriptionOrders, [1], {});
  ctxState.logger.debug(
    subscriptionOneTimeOrders,
    `
                    subsServiceItemRepo->proceedSubsServiceItems->subscriptionOneTimeOrders
                `,
  );

  if (!isEmpty(subscriptionOneTimeOrders)) {
    const templates = subscriptionOneTimeOrders.map(subscriptionOneTimeOrder => {
      oneTimeOrdersSequenceIds.push(subscriptionOneTimeOrder.sequenceId);
      oneTimeOrdersIds.push(subscriptionOneTimeOrder.id);
      return {
        ...omit(['id'])(subscriptionOneTimeOrder),
        subscriptionId: subscription.id,
        subscriptionOrderId: subscriptionOneTimeOrder.id,
      };
    });

    await Promise.all(
      subscriptionOneTimeOrders.map(
        ({ purchaseOrderId }) =>
          purchaseOrderId &&
          PurchaseOrderRepo.getInstance(ctxState).applyLevelAppliedValue(
            {
              id: purchaseOrderId,
              applicationLevel: LEVEL_APPLIED.order,
            },
            trx,
          ),
      ),
    );

    if (canGenerateOrders(subscription)) {
      return templates;
    }
  }
  return null;
};
