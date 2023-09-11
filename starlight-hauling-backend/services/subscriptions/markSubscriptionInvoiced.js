import SubscriptionServiceItemRepo from '../../repos/subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionOrderRepo from '../../repos/subscriptionOrder/subscriptionOrder.js';
import SubscriptionRepo from '../../repos/subscription/subscription.js';

import knex from '../../db/connection.js';

import { addDays } from '../../utils/dateTime.js';

import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses.js';
import { getTotalLineItemServiceItem } from './utils/getTotalLineItemServiceItem.js';
import { getBillingPeriodAfterInvoicing } from './utils/getBillingPeriodAfterInvoicing.js';

export const markSubscriptionInvoiced = async (
  ctx,
  { affectedSubscriptions, billingDate },
  trx,
) => {
  const promises = [];

  const _trx = trx || (await knex.transaction());

  const subscriptionRepo = await SubscriptionRepo.getInstance(ctx.state);
  const serviceItemRepo = SubscriptionServiceItemRepo.getInstance(ctx.state);
  // const lineItemRepo = SubscriptionLineItemRepo.getInstance(ctx.state);
  const subOrder = SubscriptionOrderRepo.getInstance(ctx.state);

  try {
    const subOrdersIdsAll = [];
    const subLineItemIdsAll = [];
    const subServiceItemIdsAll = [];
    const subscriptionsIds = [];

    for (const [subscriptionId, subscription] of affectedSubscriptions) {
      subscriptionsIds.push(subscriptionId);
      const {
        nextBillingPeriodTo,
        nextBillingPeriodFrom,
        billingCycle,
        anniversaryBilling,
        summaryPerServiceItem,
        endDate,
      } = subscription;

      const nextBillingPeriodInfo = {
        anniversaryBilling,
        billingCycle,
        startDate: addDays(nextBillingPeriodTo),
        endDate,
        nextBillingPeriodTo,
        nextBillingPeriodFrom,
      };

      const { newNextBillingPeriodFrom, newNextBillingPeriodTo } =
        getBillingPeriodAfterInvoicing(nextBillingPeriodInfo);

      const serviceItemInfo = getTotalLineItemServiceItem({ summaryPerServiceItem });

      const subscriptionPromise = subscriptionRepo.updateBy({
        condition: { id: subscriptionId },
        insertData: {
          nextBillingPeriodFrom: newNextBillingPeriodFrom,
          nextBillingPeriodTo: newNextBillingPeriodTo,
          invoicedDate: billingDate,
        },
      });

      for (const serviceItem of serviceItemInfo) {
        const { serviceItemId, lineItemIdToSum, subscriptionOrders = [] } = serviceItem;
        subServiceItemIdsAll.push(serviceItemId);

        const subOrdersIds = subscriptionOrders.map(
          ({ subscriptionOrderId }) => subscriptionOrderId,
        );

        const lineItemIds = Object.keys(lineItemIdToSum);

        subLineItemIdsAll.push(...lineItemIds);
        subOrdersIdsAll.push(...subOrdersIds);
      }

      promises.push(subscriptionPromise);
    }

    const serviceItemPromise = serviceItemRepo.updateByIds({
      ids: subServiceItemIdsAll,
      insertData: {
        invoicedDate: billingDate,
      },
    });

    const subOrderPromise = subOrder.updateByIds(
      {
        ids: subscriptionsIds,
        insertData: {
          invoicedDate: billingDate,
          status: SUBSCRIPTION_ORDER_STATUS.invoiced,
        },
      },
      _trx,
    );

    // ToDo: Updated the subscriptions Line Items
    // By: Wilson Lopez | Ticket: PS-227 | Date: 29/11/2022
    // const lineItemsPromises = lineItemRepo.updateByIds(
    //   {
    //     ids: subLineItemIdsAll,
    //     data: { invoicedDate: billingDate },
    //   },
    //   _trx,
    // );

    promises.push(serviceItemPromise, subOrderPromise); //, lineItemsPromises);

    await Promise.all(promises);

    if (!trx) {
      await _trx.commit();
    }
  } catch (error) {
    if (!trx) {
      await _trx.rollback();
    }

    throw error;
  }
};
