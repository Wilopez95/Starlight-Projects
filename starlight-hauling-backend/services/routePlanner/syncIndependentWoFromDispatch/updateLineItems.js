import isEmpty from 'lodash/isEmpty.js';

import BillableLineItemRepo from '../../../repos/billableLineItem.js';
import LineItemRepo from '../../../repos/lineItem.js';

import { LINE_ITEM_TYPE } from '../../../consts/lineItemTypes.js';

import { unambiguousSelect } from '../../../utils/dbHelpers.js';

// TODO: integrate new pricing engine
export const updateLineItems = async ({ ids, independentWosLineItems }, { ctx, trx }) => {
  const billableLineItemRepo = BillableLineItemRepo.getInstance(ctx.state);
  const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();

  const lineItemRepo = LineItemRepo.getInstance(ctx.state);

  const historicalLineItems = await billableLineItemRepo.getAllByHistoricalIds(
    {
      ids,
      fields: unambiguousSelect(billableLineItemHT, ['id', 'type']),
    },
    trx,
  );

  // TODO: integrate new pricing engine
  // TODO: clarify WTF and why is this always false
  // just copypaste from subscriber
  const addTripCharge = false;

  // TODO: integrate new pricing engine
  if (!isEmpty(historicalLineItems)) {
    if (addTripCharge) {
      await Promise.all(
        independentWosLineItems.map(({ lineItems, orderId }) =>
          lineItemRepo.upsertMany(
            {
              data: lineItems,
              orderId,
            },
            trx,
          ),
        ),
      );
    } else {
      const lineItemsIds = historicalLineItems.reduce((res, item) => {
        if (item.type !== LINE_ITEM_TYPE.tripCharge) {
          res.push(item.id);
        }
        return res;
      }, []);
      if (!isEmpty(lineItemsIds)) {
        await Promise.all(
          independentWosLineItems.map(({ lineItems, orderId }) =>
            lineItemRepo.upsertMany(
              {
                data: lineItems.filter(lineItem =>
                  lineItemsIds.includes(lineItem.billableLineItemId),
                ),
                orderId,
              },
              trx,
            ),
          ),
        );
      }
    }
  }
};
