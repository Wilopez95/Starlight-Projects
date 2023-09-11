import BillableLineItemRepo from '../../repos/billableLineItem.js';

import { LINE_ITEM_TYPE } from '../../consts/lineItemTypes.js';
import addLineItems from './addLineItems.js';

const addTripCharge = async (ctx, { order, save = false }, trx) => {
  ctx.logger.debug(`addTripCharge->save: ${save}`);
  ctx.logger.debug(`addTripCharge->order: ${JSON.stringify(order, null, 2)}`);

  const lineItemRepo = BillableLineItemRepo.getInstance(ctx.state);

  try {
    const {
      businessLine: { id: businessLineId },
    } = order;

    const { id: billableLineItemId, ...tripCharge } =
      (await lineItemRepo.getBy(
        {
          condition: {
            type: LINE_ITEM_TYPE.tripCharge,
            businessLineId,
            active: true,
          },
          fields: ['id', 'applySurcharges', 'materialBasedPricing'],
        },
        trx,
      )) ?? {};
    ctx.logger.debug(`addTripCharge->tripCharge: ${JSON.stringify(tripCharge, null, 2)}`);
    if (!billableLineItemId) {
      ctx.logger.error('No billable line items configured for trip charge');
      return [];
    }

    const lineItem = {
      ...tripCharge,
      billableLineItemId,
      materialId: null,
      quantity: 1,
    };
    ctx.logger.debug(`addTripCharge->lineItem: ${JSON.stringify(lineItem, null, 2)}`);

    const lineItems = await addLineItems(ctx, { order, lineItems: [lineItem], save }, trx);
    ctx.logger.debug(`addTripCharge->lineItems: ${JSON.stringify(lineItems, null, 2)}`);

    return lineItems;
  } catch (error) {
    ctx.logger.error(error, `Error while adding a trip charge for an order with id ${order.id}`);
    throw error;
  }
};

export default addTripCharge;
