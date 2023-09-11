import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/omit.js';

import knex from '../../db/connection.js';

import PurchaseOrderRepo from '../../repos/purchaseOrder.js';
import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
// import SubscriptionLineItemRepo from '../../repos/subscriptionLineItem.js';
// import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import DraftSubscriptionRepo from '../../repos/subscription/draftSubscription.js';

import { LEVEL_APPLIED } from '../../consts/purchaseOrder.js';
import { SUBSCRIPTION_STATUS } from '../../consts/subscriptionStatuses.js';
import {
  pricingAddDraftSubscriptions,
  pricingAddSubscriptionServiceItem,
  pricingBulkAddSubscriptionLineItem,
  pricingBulkAddSubscriptionOrder,
  pricingDeleteSubscriptions,
  pricingSequenceCount,
} from '../pricing.js';

export const createDraftSubscription = async (ctx, { data } = {}) => {
  const { serviceItems } = data;
  const subscriptionData = omit(data, ['serviceItems']);

  const trx = await knex.transaction();
  const draftSubscriptionRepo = DraftSubscriptionRepo.getInstance(ctx.state);
  const nextBillingPeriod = draftSubscriptionRepo.getNextBillingPeriod(data);
  let globalDraft;
  try {
    const insertData = {
      ...subscriptionData,
      ...nextBillingPeriod,
      status: SUBSCRIPTION_STATUS.draft,
      // customerId: customerHistoricalId?.originalId,
    };

    // pre-pricing service code:
    // const draft = await draftSubscriptionRepo.createOne(
    //   { data: insertData, fields: ['id', 'purchaseOrderId'] },
    //   trx,
    // );
    // end of pre-pricing service code
    // Create a new Draft Subscription into the new Pricing Backend
    const draft = await pricingAddDraftSubscriptions(ctx, { data: insertData });
    globalDraft = draft;
    // This is the original code created by Eleks
    // const draft = await draftSubscriptionRepo.createOne({ data: insertData, fields: ['id', 'purchaseOrderId'] }, trx);
    // end of post-pricing service code

    // Create subscription service and line items.
    if (!isEmpty(serviceItems)) {
      const serviceLineItems = [];
      const serviceSubscriptionOrders = [];

      const subscriptionServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);

      const serviceItemsInput = await subscriptionServiceItemRepo.convertNestedEntitiesToHistorical(
        { serviceItems },
        trx,
      );

      await Promise.all(
        serviceItemsInput.map(async item => {
          const { lineItems = [], subscriptionOrders = [] } = item;
          delete item.lineItems;
          delete item.subscriptionOrders;
          item.subscriptionId = draft.id;
          if (!item.billingCycle) {
            item.billingCycle = draft.billingCycle;
          }

          // pre-pricing service code:
          // const serviceItem = await SubscriptionServiceItemRepo.getInstance(ctx.state).createOne(
          //   { data: item },
          //   trx,
          // );
          // end of pre-pricing service code
          const serviceItem = await pricingAddSubscriptionServiceItem(ctx, { data: item });
          // This is the original code created by Eleks
          // const serviceItem = await SubscriptionServiceItemRepo.getInstance(ctx.state).createOne({ data: item }, trx);
          // end of post-pricing service code

          lineItems.map(lineItem => {
            lineItem.subscriptionServiceItemId = serviceItem.id;
            return serviceLineItems.push(lineItem);
          });

          subscriptionOrders.map(order => {
            order.subscriptionServiceItemId = serviceItem.id;
            order.purchaseOrderId = draft.purchaseOrderId;
            return serviceSubscriptionOrders.push(order);
          });
        }),
      );

      if (!isEmpty(serviceLineItems)) {
        // pre-pricing service code:
        // await SubscriptionLineItemRepo.getInstance(ctx.state).insertMany(
        //   { data: serviceLineItems },
        //   trx,
        // );
        // end of pre-pricing service code
        // Create many inserts into the pricing backend
        await pricingBulkAddSubscriptionLineItem(ctx, {
          data: {
            data: serviceLineItems,
          },
        });

        // This is the original code created by Eleks
        // await SubscriptionLineItemRepo.getInstance(ctx.state).insertMany({ data: serviceLineItems }, trx);
        // end of post-pricing service code
      }

      if (!isEmpty(serviceSubscriptionOrders)) {
        // Get the sequence to the current subscription
        const sequenceId = await pricingSequenceCount(ctx, { data: { id: draft.id } });

        // Create many inserts into the pricing backend
        const subOrders = await pricingBulkAddSubscriptionOrder(ctx, {
          data: {
            data: serviceSubscriptionOrders.map((item, i) => ({
              ...item,
              subscriptionId: draft.id,
              sequenceId: `${draft.id}.${sequenceId + i + 1}`,
            })),
          },
        });
        // This is the original code created by Eleks
        // const subOrders = await SubscriptionOrderRepo.getInstance(ctx.state).insertMany(
        //   {
        //     subscriptionId: draft.id,
        //     data: serviceSubscriptionOrders,
        //     fields: ['purchaseOrderId'],
        //   },
        //   trx,
        // );

        await Promise.all(
          subOrders.map(
            ({ purchaseOrderId }) =>
              purchaseOrderId &&
              PurchaseOrderRepo.getInstance(ctx.state).applyLevelAppliedValue(
                {
                  id: purchaseOrderId,
                  applicationLevel: LEVEL_APPLIED.order,
                },
                trx,
              ),
          ),
        );
      }

      await draftSubscriptionRepo.updateServiceFrequencyDescription(
        {
          id: draft.id,
        },
        ctx,
      );
    }

    if (draft.purchaseOrderId) {
      await PurchaseOrderRepo.getInstance(ctx.state).applyLevelAppliedValue(
        {
          id: draft.purchaseOrderId,
          applicationLevel: LEVEL_APPLIED.subscription,
        },
        trx,
      );
    }

    await trx.commit();

    return draft;
  } catch (err) {
    if (globalDraft !== undefined) {
      await pricingDeleteSubscriptions(ctx, globalDraft.id);
    }
    await trx.rollback();

    throw err;
  }
};
