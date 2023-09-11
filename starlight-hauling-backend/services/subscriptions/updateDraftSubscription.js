import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/omit.js';
import pick from 'lodash/pick.js';

import knex from '../../db/connection.js';

import PurchaseOrderRepo from '../../repos/purchaseOrder.js';
import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import DraftSubscriptionRepo from '../../repos/subscription/draftSubscription.js';

import { mapUpdateEvents } from '../../utils/updateEvents.js';

import { LEVEL_APPLIED } from '../../consts/purchaseOrder.js';
import { SUBSCRIPTION_STATUS } from '../../consts/subscriptionStatuses.js';
import {
  pricingUpsertSubsServiceItem,
  pricingAlterSubscriptions,
  pricingAlterSubscriptionServiceItem,
  pricingAlterSubscriptionLineItem,
  pricingDeleteSubscriptionLineItem,
  pricingDeleteSubscriptionServiceItem,
  pricingUpdateSubscriptionOrder,
  pricingBulkAddSubscriptionOrder,
  pricingBulkAddSubscriptionLineItem,
  pricingDeleteSubscriptionsOrders,
  pricingGetAllSubscriptionOrdersByIds,
} from '../pricing.js';
import { getLinkedHistoricalIds } from './getLinkedHistoricalIds.js';

export const updateDraftSubscription = async (
  ctx,
  { condition: { id: subscriptionDraftId }, data } = {},
) => {
  const {
    serviceItems: serviceItemsUpdates,
    lineItems: lineItemsUpdates,
    subscriptionOrders: subscriptionOrdersUpdates,
  } = data;
  const draftData = omit(data, ['serviceItems', 'lineItems', 'subscriptionOrders']);

  data.status = SUBSCRIPTION_STATUS.draft;

  const subscriptionServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);
  const trx = await knex.transaction();
  const draftSubscriptionRepo = DraftSubscriptionRepo.getInstance(ctx.state);

  let draft;
  try {
    draft = await pricingAlterSubscriptions(
      ctx,
      {
        data: draftData,
      },
      subscriptionDraftId,
    );

    if (!isEmpty(serviceItemsUpdates)) {
      const {
        add: addServiceItems,
        edit: editServiceItems,
        remove: removeServiceItems,
      } = mapUpdateEvents(serviceItemsUpdates);

      if (!isEmpty(addServiceItems)) {
        const serviceLineItems = [];
        const serviceSubscriptionOrders = [];

        const addServiceItemsInput =
          await subscriptionServiceItemRepo.convertNestedEntitiesToHistorical(
            { serviceItems: addServiceItems },
            trx,
          );

        await Promise.all(
          addServiceItemsInput.map(async item => {
            const { lineItems = [], subscriptionOrders = [] } = item;

            const serviceItemInput = {
              ...omit(item, ['eventType', 'lineItems', 'subscriptionOrders']),
              subscriptionId: subscriptionDraftId,
            };

            // pre-pricing service code:
            // const serviceItem = await subscriptionServiceItemRepo.createOne(
            //   { data: serviceItemInput },
            //   trx,
            // );
            // end of pre-pricing service code
            const serviceItem = await pricingUpsertSubsServiceItem(ctx, {
              data: serviceItemInput,
            });
            // end post-pricing service code:

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
          await pricingAlterSubscriptionLineItem(ctx, {
            data: {
              data: serviceLineItems,
            },
          });
        }

        if (!isEmpty(serviceSubscriptionOrders)) {
          const subOrders = await pricingBulkAddSubscriptionOrder(ctx, {
            data: {
              data: serviceSubscriptionOrders.map(item => ({
                ...item,
                subscriptionId: subscriptionDraftId,
              })),
            },
          });

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
      }

      if (!isEmpty(editServiceItems)) {
        const editServiceItemsInput =
          await subscriptionServiceItemRepo.convertNestedEntitiesToHistorical(
            { serviceItems: editServiceItems },
            trx,
          );

        await Promise.all(
          editServiceItemsInput.map(item =>
            // pre-pricing service code:
            // subscriptionServiceItemRepo.updateBy(
            //   {
            //     condition: { id: item.id },
            //     data: omit(item, ['eventType']),
            //   },
            //   trx,
            // ),
            // end of pre-pricing service code
            pricingAlterSubscriptionServiceItem(ctx, { data: item }, item.id),
          ),
        );
      }

      if (!isEmpty(removeServiceItems)) {
        // pre-pricing service code:
        // await subscriptionServiceItemRepo.deleteByIds(
        //   { ids: removeServiceItems.map(item => item.id) },
        //   trx,
        // end of pre-pricing service code
        await Promise.all(
          removeServiceItems.map(item => pricingDeleteSubscriptionServiceItem(ctx, { data: item })),
          // end post-pricing service code:
        );
      }

      await draftSubscriptionRepo.updateServiceFrequencyDescription(
        {
          id: subscriptionDraftId,
        },
        trx,
      );
    }

    if (!isEmpty(lineItemsUpdates)) {
      const {
        add: addLineItems,
        edit: editLineItems,
        remove: removeLineItems,
      } = mapUpdateEvents(lineItemsUpdates);

      if (!isEmpty(addLineItems)) {
        await Promise.all(
          addLineItems.map(async item => {
            const updatedItem = await getLinkedHistoricalIds(
              trx,
              ctx.state.user.schemaName,
              DraftSubscriptionRepo.getHistoricalTableName,
              {
                linkedData: pick(item, [
                  'billableLineItemId',
                  'globalRatesRecurringLineItemsBillingCycleId',
                  'customRatesGroupRecurringLineItemBillingCycleId',
                ]),
              },
            );

            Object.assign(item, updatedItem);
          }),
        );

        // pre-pricing service code:
        // await subscriptionLineItemRepo.insertMany(
        //   { data: addLineItems.map(item => omit(item, ['eventType'])) },
        //   trx,
        // );
        // end of pre-pricing service code
        if (addLineItems?.length) {
          await pricingBulkAddSubscriptionLineItem(ctx, {
            data: { data: addLineItems.map(item => omit(item, ['eventType'])) },
          });
        }
        // end of post-pricing service code:
      }

      if (!isEmpty(editLineItems)) {
        await Promise.all(
          editLineItems.map(async item => {
            const updatedItem = await getLinkedHistoricalIds(
              trx,
              ctx.state.user.schemaName,
              DraftSubscriptionRepo.getHistoricalTableName,
              {
                linkedData: pick(item, [
                  'billableLineItemId',
                  'globalRatesRecurringLineItemsBillingCycleId',
                  'customRatesGroupRecurringLineItemBillingCycleId',
                ]),
              },
            );

            Object.assign(item, updatedItem);

            await pricingAlterSubscriptionLineItem(ctx, { data: item }, item.id);
          }),
        );
      }

      if (!isEmpty(removeLineItems)) {
        // pre-pricing service code:
        // await subscriptionLineItemRepo.deleteByIds(
        //   { ids: removeLineItems.map(item => item.id) },
        //   trx,
        // end  of pre-pricing service code
        await Promise.all(
          removeLineItems.map(item =>
            pricingDeleteSubscriptionLineItem(ctx, { data: item }, item.id),
          ),
          // end of post-pricing service code:
        );
      }
    }

    if (!isEmpty(subscriptionOrdersUpdates)) {
      const {
        add: addSubscriptionOrders,
        edit: editSubscriptionOrders,
        remove: removeSubscriptionOrders,
      } = mapUpdateEvents(subscriptionOrdersUpdates);

      if (!isEmpty(addSubscriptionOrders)) {
        const subOrdersInsertData = await Promise.all(
          addSubscriptionOrders.map(async item => {
            // pre-pricing service code:
            // const updatedItem = await subscriptionOrderRepository.getLinkedHistoricalIds(
            //   pick(item, [
            //     'globalRatesServicesId',
            //     'customRatesGroupServicesId',
            //     'billableServiceId',
            //   ]),
            //   { entityRepo: draftSubscriptionRepo },
            //   trx,
            // );
            // end of pre-pricing service code
            const updatedItem = await pricingGetAllSubscriptionOrdersByIds(ctx, {
              data: { Ids: subscriptionOrdersUpdates.map(x => x.id) },
            });

            return {
              ...omit(item, ['eventType']),
              ...updatedItem,
              purchaseOrderId: draft.purchaseOrderId,
            };
          }),
        );
        const subOrders = await pricingBulkAddSubscriptionOrder(ctx, {
          data: {
            data: subOrdersInsertData.map(item => ({
              ...item,
              subscriptionId: subscriptionDraftId,
            })),
          },
        });

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

      if (!isEmpty(editSubscriptionOrders)) {
        await Promise.all(
          // pre-pricing service code:
          // editSubscriptionOrders.map(item =>
          //   subscriptionOrderRepository.updateBy(
          //     {
          //       condition: { id: item.id },
          //       data: omit(item, ['eventType']),
          //     },
          //     trx,
          //   ),
          // ),
          // end of pre-pricing service code
          editSubscriptionOrders.map(item => pricingUpdateSubscriptionOrder(ctx, { data: item })),
        );
      }

      if (!isEmpty(removeSubscriptionOrders)) {
        // pre-pricing service code:
        // await subscriptionOrderRepository.deleteByIds(
        //   { ids: removeSubscriptionOrders.map(item => item.id) },
        //   trx,
        // );
        // end of pre-pricing service code
        await pricingDeleteSubscriptionsOrders(ctx, {
          data: removeSubscriptionOrders.map(item => item.id),
        });

        await Promise.all(
          removeSubscriptionOrders.map(
            ({ purchaseOrderId }) =>
              purchaseOrderId &&
              PurchaseOrderRepo.getInstance(ctx.state)
                .checkIfShouldRemoveLevelAppliedValue(purchaseOrderId, trx)
                .order(),
          ),
        );
      }
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
  } catch (err) {
    await trx.rollback();

    throw err;
  }

  return draft;
};
