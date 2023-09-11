import isEmpty from 'lodash/isEmpty.js';

import BillableLineItemRepo from '../../../repos/billableLineItem.js';

import { unambiguousSelect } from '../../../utils/dbHelpers.js';
import { LINE_ITEM_TYPE } from '../../../consts/lineItemTypes.js';
import { pricingUpsertSubscriptionWorkOrdersLineItems } from '../../pricing.js';

export const updateWorkOrderLineItems = async (
  //   { subscriptionOrderId, subsWosLineItemsIds, subsWosLineItems },
  //   { trx, ctx },
  // ) => {
  // pre-pricing service code https://d.pr/i/An4IKZ
  //   const subscriptionOrderRepo = SubscriptionOrderRepo.getInstance(ctx.state);
  //   const subscriptionWoLineItemRepo = subscriptionWorkOrderLineItemRepo.getInstance(ctx.state);
  { subsWosLineItemsIds, subsWosLineItems, subOrder },
  { trx, ctx },
) => {
  const billableLineItemRepo = BillableLineItemRepo.getInstance(ctx.state);
  const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
  const addTripCharge = !isEmpty(subsWosLineItemsIds) ? subOrder.addTripCharge : false;
  const [historicalLineItems] = await Promise.all([
    !isEmpty(subsWosLineItems)
      ? billableLineItemRepo.getAllByHistoricalIds(
          {
            ids: subsWosLineItemsIds,
            fields: unambiguousSelect(billableLineItemHT, ['id', 'type']),
          },
          trx,
        )
      : [],
  ]);

  if (!isEmpty(subsWosLineItems) && !isEmpty(historicalLineItems)) {
    ctx.logger.debug(
      subsWosLineItems,
      `
                    syncSubsWosFromDispatch->subscriber->subsWosLineItems
                `,
    );
    if (addTripCharge) {
      await Promise.all(
        subsWosLineItems.forEach(item => {
          pricingUpsertSubscriptionWorkOrdersLineItems(ctx, { data: { ...item } });
        }),
      );
    } else {
      const lineItemsIds = historicalLineItems.reduce((res, item) => {
        if (item.type !== LINE_ITEM_TYPE.tripCharge) {
          res.push(item.id);
        }
        return res;
      }, []);

      if (!isEmpty(lineItemsIds)) {
        // pre-pricing service code:
        // await subscriptionWoLineItemRepo.upsertMany(
        //   {
        //     data: subsWosLineItems.filter(lineItem =>
        //       lineItemsIds.includes(lineItem.billableLineItemId),
        //     ),
        //   },
        //   trx,
        // end pre-pricing service code
        await Promise.all(
          subsWosLineItems.forEach(lineItem => {
            if (lineItemsIds.includes(lineItem.billableLineItemId)) {
              pricingUpsertSubscriptionWorkOrdersLineItems(ctx, { data: { ...lineItem } });
            }
          }),
        );
      }
    }
  }
};
