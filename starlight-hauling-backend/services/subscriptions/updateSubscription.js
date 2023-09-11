/* eslint-disable complexity */
import { startOfToday, addDays } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';
import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/omit.js';
import pick from 'lodash/fp/pick.js';
// import difference from 'lodash/difference.js';

import knex from '../../db/connection.js';

import CustomerJobSitePairRepo from '../../repos/customerJobSitePair.js';
import PurchaseOrderRepo from '../../repos/purchaseOrder.js';
import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
// import SubscriptionLineItemRepo from '../../repos/subscriptionLineItem.js';
import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionRepo from '../../repos/subscription/subscription.js';

import { proceedSubscriptionServiceItems } from '../subscriptionServiceItems/proceedSubscriptionServiceItems.js';
import { publishers } from '../ordersGeneration/publishers.js';
import { publishers as routePlannerPuplishers } from '../routePlanner/publishers.js';
import { updateBasedOnSnapshot as updateServiceItem } from '../subscriptionServiceItems/updateBasedOnSnapshot.js';
import { updateBasedOnSnapshot as updateLineItem } from '../subscriptionRecurringLineItems/updateBasedOnSnapshot.js';
import { proceedUpdates } from '../subscriptionOrders/proceedUpdates.js';
import { subscriptionHistoryEmitter } from '../subscriptionHistory/emitter.js';

import { mapUpdateEvents } from '../../utils/updateEvents.js';
// import { unambiguousSelect } from '../../utils/dbHelpers.js';

import { getLinkedInputFields } from '../../consts/subscriptions.js';
import { SUBSCRIPTION_STATUS } from '../../consts/subscriptionStatuses.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses.js';
import { ACTION } from '../../consts/actions.js';
import { LEVEL_APPLIED } from '../../consts/purchaseOrder.js';
import { SUBSCRIPTION_HISTORY_EVENT } from '../../consts/subscriptionHistoryEvents.js';
import { SUBSCTIPTION_HISTORY_ENTITY_ACTION } from '../../consts/subscriptionHistoryEntityActions.js';
import {
  pricingGetSubscriptionById,
  pricingAlterSubscriptions,
  // pricingUpsertSubsServiceItem,
  pricingBulkAddSubscriptionLineItem,
  // pricingUpsertLineItems,
} from '../pricing.js';
import BillableServiceRepository from '../../repos/billableService.js';
import { getLinkedHistoricalIds } from './getLinkedHistoricalIds.js';
import { putOffHold } from './putOffHold.js';
import { putOnHold } from './putOnHold.js';
import { validateCreditLimit } from './utils/validateCreditLimit.js';
import { getNextBillingPeriodForSubUpdate } from './utils/getNextBillingPeriodForSubUpdate.js';
import { getServiceAndLineItemIds } from './getServiceAndLineItemHistoricalIds.js';

import { detectChanges } from './utils/detectChanges.js';
import { initSubscriptionDates } from './utils/initSubscriptionDates.js';

const { zonedTimeToUtc } = dateFnsTz;
export const updateSubscription = async (
  ctx,
  {
    condition: { id: subscriptionId },
    data: {
      serviceItems: serviceItemsUpdates,
      lineItems: lineItemsUpdates,
      subscriptionOrders: subscriptionOrdersUpdates,
      offHold,
      onHold,
      ...subscriptionData
    },
    fields = ['*'],
    availableCredit,
  } = {},
) => {
  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);
  const subsServiceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);
  const customerJobSitePairRepo = CustomerJobSitePairRepo.getInstance(ctx.state);

  const subsOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);

  const linkedData = getLinkedInputFields(subscriptionData);

  const trx = await knex.transaction();
  const subscriptionRecurringOrdersTemplates = [];
  const subscriptionOneTimeWorkOrdersTemplates = [];
  const serviceItemsToSync = [];
  const deletedWosToSync = [];
  try {
    if (onHold) {
      await putOnHold(ctx, { condition: { subscriptionId }, updateForm: true }, trx);
      Object.assign(subscriptionData, { status: SUBSCRIPTION_STATUS.onHold });
    }

    if (subscriptionOrdersUpdates?.length) {
      for (let index = 0; index < subscriptionOrdersUpdates.length; index++) {
        const subsOrder = subscriptionOrdersUpdates[index];
        const billableService = await BillableServiceRepository.getHistoricalInstance(
          ctx.state,
        ).getRecentBy({
          condition: { originalId: subsOrder.billableServiceId },
        });
        subsOrder.billableServiceId = billableService.id;
      }
    }

    let subscription;
    const subscriptionServiceItemsUpdates = {};
    const subscriptionLineItemsUpdates = {};
    const oneTimeSubscriptionOrdersUpdates = {};

    const [oldSubscription, oldSubscriptionPopulated] = await Promise.all([
      pricingGetSubscriptionById(ctx, { id: subscriptionId }),
      pricingGetSubscriptionById(ctx, { id: subscriptionId }),
    ]);

    if (oldSubscription.status !== SUBSCRIPTION_STATUS.closed) {
      // eslint-disable-next-line max-len
      // pre-pricing service code:
      // const historicalLinkedFields = await getLinkedHistoricalIds(
      //   trx,
      //   ctx.state.user.schemaName,
      //   SubscriptionRepo.getHistoricalTableName,
      //   {
      //     linkedData,
      //     existingItem: oldSubscription,
      //   },
      // );
      // end of pre-pricing service code
      const historicalLinkedFields = await getLinkedHistoricalIds(trx, ctx.state.user.schemaName, {
        linkedData,
        existingItem: oldSubscription,
      });

      Object.assign(subscriptionData, historicalLinkedFields);

      const today = startOfToday();

      const { subscriptionChangeAffectsServicing, receivedEndDate } = detectChanges({
        subscriptionData,
        oldSubscription,
        today,
      });

      ctx.logger.debug(
        subscriptionChangeAffectsServicing,
        'subsRepo->updateOne->subscriptionChangeAffectsServicing',
      );

      ctx.logger.debug(receivedEndDate, 'subsRepo->updateOne->receivedEndDate');

      const nextBillingPeriodInfo = {
        anniversaryBilling: oldSubscription.anniversaryBilling,
        billingCycle: oldSubscription.billingCycle,

        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,

        nextBillingPeriodFrom: new Date(oldSubscription.nextBillingPeriodFrom),
        nextBillingPeriodTo: new Date(oldSubscription.nextBillingPeriodTo),

        oldEndDate: oldSubscription.endDate,
        oldStartDate: oldSubscription.startDate,
      };

      const { nextBillingPeriodFrom, nextBillingPeriodTo } =
        getNextBillingPeriodForSubUpdate(nextBillingPeriodInfo);

      if (offHold) {
        Object.assign(subscriptionData, { status: SUBSCRIPTION_STATUS.active });
      }

      ctx.logger.debug(`subsRepo->updateOne->override: ${subscriptionData.overrideCreditLimit}`);
      ctx.logger.debug(`subsRepo->updateOne->availableCredit: ${availableCredit}`);
      if (!subscriptionData.overrideCreditLimit) {
        if (oldSubscription.overrideCreditLimit) {
          subscriptionData.overrideCreditLimit = true;
        } else {
          const priceDifference = subscriptionData.grandTotal - oldSubscription.grandTotal;
          ctx.logger.debug(`subsRepo->updateOne->priceDifference: ${priceDifference}`);
          if (priceDifference > 0) {
            validateCreditLimit(subscriptionData, availableCredit, priceDifference);
          }
        }
      }

      subscription = await pricingAlterSubscriptions(
        ctx,
        {
          data: {
            ...subscriptionData,
            nextBillingPeriodFrom,
            nextBillingPeriodTo,
            jobSiteNote: subscriptionData.popupNote || oldSubscription.jobSiteNote,
          },
          // pre-pricing service code:
          // fields: Array.from(
          //   new Set([
          //     ...difference(fields, subscriptionFieldsForOrders),
          //     ...subscriptionFieldsForOrders.map(i => `${subscriptionRepo.tableName}.${i}`),
          //     'customerJobSiteId',
          //   ]),
          // ),
          // concurrentData,
          // end of pre-pricing service code
        },
        subscriptionId,
      );

      if (offHold) {
        await putOffHold(
          ctx,
          {
            condition: { subscriptionId },
            updatedSubscription: {
              onHoldEmailSent: false,
              onHoldNotifyMainContact: false,
              onHoldNotifySalesRep: false,
              ...subscription,
            },
          },
          trx,
        );
      }

      const linkedPair = await customerJobSitePairRepo.getHistoricalRecordById({
        id: subscription.customerJobSiteId,
      });

      const { tomorrow, subscriptionEndDate, firstOrderDate } = initSubscriptionDates(subscription);

      const serviceItemsToUpdateIds = [];

      // servicing can change not only due to direct service item change
      // but also due to propagated change of subscription parameters
      if (subscriptionChangeAffectsServicing) {
        // pre-pricing service code:
        // const serviceItems = await subsServiceItemRepo.getBySubscriptionId({ subscriptionId }, trx);
        // end of pre-pricing service code
        // ToDo: Change this endpoint
        // By: Esteban Navarro | Ticket: PS-232 | Date: 09/09/2022
        // Done
        const subscriptionServiceItems = await pricingGetSubscriptionById(ctx, {
          id: subscriptionId,
        });
        const { serviceItems } = subscriptionServiceItems;

        ctx.logger.debug(
          serviceItems,
          'subsRepo->updateOne->subscriptionChangeAffectsServicing->serviceItems',
        );

        const servicingServiceItems = serviceItems?.filter(
          item => item.billableService.action === ACTION.service,
        );
        ctx.logger.debug(
          servicingServiceItems.length,
          'subsRepo->updateOne->servicingServiceItems.length',
        );
        if (servicingServiceItems.length) {
          servicingServiceItems.forEach(item => {
            serviceItemsToUpdateIds.push(item.id);
          });
        }
      }
      if (receivedEndDate) {
        // remove servicing and re-generate then for new set of dates
        const { deletedWorkOrders: serviceDeleted } = await subsOrderRepo.cleanOrders(
          {
            subscriptionIds: [subscriptionId],
            statuses: [SUBSCRIPTION_ORDER_STATUS.scheduled],
            types: [ACTION.service],
          },
          trx,
        );

        deletedWosToSync.push(...serviceDeleted);
        // remove anything except final after end date
        const { deletedWorkOrders: finalDeleted } = await subsOrderRepo.cleanOrders(
          {
            subscriptionIds: [subscriptionId],
            statuses: [SUBSCRIPTION_ORDER_STATUS.scheduled],
            excludeTypes: [ACTION.final],
            // last orders can be on the last day of service
            effectiveDate: addDays(zonedTimeToUtc(subscription.endDate, 'UTC'), 1),
          },
          trx,
        );

        deletedWosToSync.push(...finalDeleted);
      }

      if (serviceItemsUpdates?.length) {
        const {
          add: addServiceItems,
          edit: editServiceItems,
          remove: removeServiceItems,
        } = mapUpdateEvents(serviceItemsUpdates);

        if (addServiceItems?.length) {
          subscriptionServiceItemsUpdates.addServiceItems = addServiceItems;

          const { serviceItems: serviceItemsInput, originalIdsMap } =
            // pre-pricing service code:
            // await getServiceAndLineItemHistoricalIds(
            //   trx,
            //   ctx.state.user.schemaName,
            //   SubscriptionRepo.getHistoricalTableName,
            //   {
            //     serviceItems: addServiceItems.map(item => omit(item, ['eventType'])),
            //   },
            // );
            // end of pre-pricing service code
            await getServiceAndLineItemIds({
              serviceItems: addServiceItems.map(item => omit(item, ['eventType'])),
            });
          // end of post-pricing service code

          const { subscriptionBillableServicesMap, oneTimeBillableServicesMap } =
            await subsServiceItemRepo.collectSubscriptionBillableServices(serviceItemsInput);

          const {
            subscriptionRecurringOrdersTemplates: recurringOrdersTemplates,
            subscriptionOneTimeWorkOrdersTemplates: oneTimeWorkOrdersTemplates,
            serviceItems: addedServiceItems,
          } = await proceedSubscriptionServiceItems(
            ctx,
            {
              serviceItemsInput,
              subscription: {
                ...subscription,
                signatureRequired: linkedPair.signatureRequired,
                alleyPlacement: linkedPair.alleyPlacement,
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

          serviceItemsToSync.push(...addedServiceItems);

          if (recurringOrdersTemplates?.length) {
            subscriptionRecurringOrdersTemplates.push(...recurringOrdersTemplates);
          }
          if (oneTimeWorkOrdersTemplates?.length) {
            subscriptionOneTimeWorkOrdersTemplates.push(...oneTimeWorkOrdersTemplates);
          }
        }

        if (editServiceItems?.length) {
          subscriptionServiceItemsUpdates.editServiceItems = editServiceItems;

          // pre-pricing service code:
          // const serviceItems = await subsServiceItemRepo.getBySubscriptionId(
          //   { subscriptionId, ids: editServiceItems.map(item => item.id) },
          //   trx,
          // );
          // end of pre-pricing service code
          // ToDo: Change this endpoint
          // By: Esteban Navarro | Ticket: PS-232 | Date: 09/09/2022
          // Done
          const subscriptionServiceItems = await pricingGetSubscriptionById(ctx, {
            id: subscriptionId,
          });
          const { serviceItems } = subscriptionServiceItems;

          serviceItemsToSync.push(...serviceItems);

          ctx.logger.debug(serviceItems, 'subsRepo->updateOne->editServiceItems->serviceItems');

          const servicingServiceItems = serviceItems?.filter(
            item => item.billableService.action === ACTION.service,
          );
          ctx.logger.debug(
            servicingServiceItems.length,
            'subsRepo->updateOne->editServiceItems->servicingServiceItems.length',
          );
          if (servicingServiceItems.length) {
            servicingServiceItems.forEach(item => {
              if (!serviceItemsToUpdateIds.includes(item.id)) {
                serviceItemsToUpdateIds.push(item.id);
              }
            });
          }

          await Promise.all(
            editServiceItems.map(({ id, eventType, unlockOverrides, effectiveDate, ...updates }) =>
              updateServiceItem(
                ctx,
                {
                  subscription,
                  id,
                  effectiveDate,
                  unlockOverrides,
                  recalculate: true,
                  ...updates,
                },
                trx,
              ),
            ),
          );
        }

        if (removeServiceItems?.length) {
          subscriptionServiceItemsUpdates.removeServiceItems = removeServiceItems;

          await Promise.all(
            removeServiceItems.map(({ id, effectiveDate }) =>
              updateServiceItem(
                ctx,
                {
                  subscription,
                  id,
                  effectiveDate,
                  endDate: effectiveDate,
                  isDeleted: true,
                  recalculate: true,
                },
                trx,
              ),
            ),
          );

          serviceItemsToSync.push(...removeServiceItems);
        }

        await subscriptionRepo.updateServiceFrequencyDescription(
          {
            id: subscriptionId,
            oldValue: oldSubscription.serviceFrequency,
          },
          trx,
        );
      }

      if (lineItemsUpdates?.length) {
        const {
          add: addLineItems,
          edit: editLineItems,
          remove: removeLineItems,
        } = mapUpdateEvents(lineItemsUpdates);

        if (addLineItems?.length) {
          subscriptionLineItemsUpdates.addLineItems = addLineItems;

          // pre-pricing service code:
          // await Promise.all(
          //   addLineItems.map(async item => {
          //     const updatedItem = await getLinkedHistoricalIds(
          //       trx,
          //       ctx.state.user.schemaName,
          //       SubscriptionRepo.getHistoricalTableName,
          //       {
          //         linkedData: pick([
          //           'billableLineItemId',
          //           'globalRatesRecurringLineItemsBillingCycleId',
          //           'customRatesGroupRecurringLineItemBillingCycleId',
          //         ])(item),
          //       },
          //     );

          //     Object.assign(item, updatedItem);
          //   }),
          // );

          // await subscriptionLineItemRepo.insertMany(
          //   { data: addLineItems.map(item => omit(item, ['eventType'])) },
          //   trx,
          // );
          // end of pre-pricing service code
          await pricingBulkAddSubscriptionLineItem(ctx, {
            data: { data: addLineItems.map(item => omit(item, ['eventType'])) },
          });
        }

        if (editLineItems?.length) {
          subscriptionLineItemsUpdates.editLineItems = editLineItems;

          await Promise.all(
            editLineItems.map(
              ({
                id,
                eventType,
                subscriptionServiceItemId,
                effectiveDate,
                unlockOverrides,
                ...updates
              }) =>
                // pre-pricing service code:
                // updateLineItem(
                //   ctx,
                //   {
                //     subscription,
                //     id,
                //     effectiveDate,
                //     unlockOverrides,
                //     ...updates,
                //   },
                //   trx,
                // ),
                // end of pre-pricing service code
                updateLineItem(ctx, {
                  subscription,
                  id,
                  effectiveDate,
                  unlockOverrides,
                  ...updates,
                }),
            ),
          );
        }

        if (removeLineItems?.length) {
          subscriptionLineItemsUpdates.removeLineItems = removeLineItems;

          await Promise.all(
            removeLineItems.map(({ id, effectiveDate }) =>
              updateLineItem(ctx, {
                subscription,
                id,
                effectiveDate,
                endDate: effectiveDate,
                isDeleted: true,
              }),
            ),
          );
        }
      }

      ctx.logger.debug(serviceItemsToUpdateIds, 'subsRepo->updateOne->serviceItemsToUpdateIds');

      if (serviceItemsToUpdateIds.length) {
        // pre-pricing service code:
        // const serviceItems = await subsServiceItemRepo.getBySubscriptionId(
        //   { subscriptionId, ids: serviceItemsToUpdateIds },
        //   trx,
        // );
        // end of pre-pricing service code
        const subscriptionServiceItems = await pricingGetSubscriptionById(ctx, {
          id: subscriptionId,
        });
        const { serviceItems } = subscriptionServiceItems;

        // const serviceItems = await subsServiceItemRepo.getBySubscriptionId({ subscriptionId, ids: serviceItemsToUpdateIds }, trx);

        ctx.logger.debug(
          serviceItems,
          'subsRepo->updateOne->serviceItemsToUpdateIds->serviceItems',
        );

        const { deletedWorkOrders } = await subsOrderRepo.cleanOrders(
          {
            subscriptionIds: [subscriptionId],
            statuses: [SUBSCRIPTION_ORDER_STATUS.scheduled],
            types: [ACTION.service],
          },
          trx,
        );

        deletedWosToSync.push(...deletedWorkOrders);

        // pre-pricing service code:
        // const { serviceItems: serviceItemsInput, originalIdsMap } =
        //   await getServiceAndLineItemHistoricalIds(
        //     trx,
        //     ctx.state.user.schemaName,
        //     SubscriptionRepo.getHistoricalTableName,
        //     {
        //       serviceItems,
        //       skipQuerying: true,
        //     },
        //   );
        // end of pre-pricing service code
        const { serviceItems: serviceItemsInput, originalIdsMap } = await getServiceAndLineItemIds({
          serviceItems,
          skipQuerying: true,
        });

        const { subscriptionBillableServicesMap, oneTimeBillableServicesMap } =
          await subsServiceItemRepo.collectSubscriptionBillableServices(serviceItemsInput);

        // TODO: not re-generate here if only text fields changed
        const {
          subscriptionRecurringOrdersTemplates: recurringOrdersTemplates,
          subscriptionOneTimeWorkOrdersTemplates: oneTimeWorkOrdersTemplates,
        } = await proceedSubscriptionServiceItems(
          ctx,
          {
            serviceItemsInput,
            subscription: {
              ...subscription,
              signatureRequired: linkedPair.signatureRequired,
              alleyPlacement: linkedPair.alleyPlacement,
            },
            firstOrderDate,
            subscriptionEndDate,
            today,
            tomorrow,
            subscriptionBillableServicesMap,
            oneTimeBillableServicesMap,
            originalIdsMap,
            skipInsertServiceItems: true,
            useEffectiveDate: true,
          },
          trx,
        );
        if (recurringOrdersTemplates?.length) {
          subscriptionRecurringOrdersTemplates.push(...recurringOrdersTemplates);
        }
        if (oneTimeWorkOrdersTemplates?.length) {
          subscriptionOneTimeWorkOrdersTemplates.push(...oneTimeWorkOrdersTemplates);
        }
      }
    }

    const { deletedWorkOrders, oneTimeWosTemplates } = await proceedUpdates(
      ctx,
      {
        subscription,
        data: subscriptionOrdersUpdates,
        availableCredit,
        overrideCreditLimit: subscription.overrideCreditLimit,
        subsRepo: subscriptionRepo,
        oneTimeSubscriptionOrdersUpdates,
      },
      trx,
    );

    deletedWosToSync.push(...deletedWorkOrders);

    if (!isEmpty(oneTimeWosTemplates)) {
      subscriptionOneTimeWorkOrdersTemplates.push(...oneTimeWosTemplates);
    }

    if (oldSubscription.purchaseOrderId !== subscriptionData.purchaseOrderId) {
      await PurchaseOrderRepo.getInstance(ctx.state)
        .checkIfShouldRemoveLevelAppliedValue(oldSubscription.purchaseOrderId, trx)
        .subscription();
    }

    if (subscriptionData.purchaseOrderId) {
      await PurchaseOrderRepo.getInstance(ctx.state).applyLevelAppliedValue(
        {
          id: subscriptionData.purchaseOrderId,
          applicationLevel: LEVEL_APPLIED.subscription,
        },
        trx,
      );
    }

    await trx.commit();

    ctx.logger.debug(
      subscriptionRecurringOrdersTemplates,
      'subsRepo->updateOne->subscriptionRecurringOrdersTemplates',
    );
    ctx.logger.debug(
      subscriptionOneTimeWorkOrdersTemplates,
      'subsRepo->updateOne->subscriptionOneTimeWorkOrdersTemplates',
    );

    if (subscriptionRecurringOrdersTemplates?.length) {
      await publishers.generateSubscriptionOrders(ctx, {
        templates: subscriptionRecurringOrdersTemplates,
      });
    }
    if (subscriptionOneTimeWorkOrdersTemplates?.length) {
      await publishers.generateSubscriptionWorkOrders(ctx, {
        templates: subscriptionOneTimeWorkOrdersTemplates,
      });
    }

    if (!isEmpty(serviceItemsToSync)) {
      await routePlannerPuplishers.syncServiceItemsToDispatch(ctx, {
        serviceItems: serviceItemsToSync,
      });
    }

    if (!isEmpty(deletedWosToSync)) {
      await routePlannerPuplishers.syncDeleteWosToDispatch(ctx, {
        isIndependent: false,
        deletedWorkOrders: deletedWosToSync,
      });
    }

    const newSubscriptionPopulated = await pricingGetSubscriptionById(ctx, { id: subscriptionId });
    // const newSubscriptionPopulated = await subscriptionRepo.getByIdPopulated({
    //   id: subscriptionId,
    // });

    subscriptionHistoryEmitter.emit(
      SUBSCRIPTION_HISTORY_EVENT.subscriptionUpdated,
      ctx.state,
      oldSubscriptionPopulated,
      newSubscriptionPopulated,
      subscriptionServiceItemsUpdates,
      subscriptionLineItemsUpdates,
      oneTimeSubscriptionOrdersUpdates,
    );

    if (onHold) {
      subscriptionHistoryEmitter.emit(SUBSCRIPTION_HISTORY_EVENT.additionalAction, ctx.state, {
        entityAction: SUBSCTIPTION_HISTORY_ENTITY_ACTION.putOnHold,
        subscriptionId,
      });
    }
    if (offHold) {
      subscriptionHistoryEmitter.emit(SUBSCRIPTION_HISTORY_EVENT.additionalAction, ctx.state, {
        entityAction: SUBSCTIPTION_HISTORY_ENTITY_ACTION.resume,
        subscriptionId,
      });
    }

    return pick(Array.from(new Set(['id', ...fields])))(subscription || oldSubscription);
  } catch (err) {
    await trx.rollback();

    throw err;
  }
};
