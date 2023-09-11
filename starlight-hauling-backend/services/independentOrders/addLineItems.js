import pick from 'lodash/fp/pick.js';
import omit from 'lodash/fp/omit.js';

import PriceRepo from '../../repos/prices.js';
import LineItemRepo from '../../repos/v2/lineItem.js';

import applyPricesToLineItems from '../pricesCalculation/order/prices/applyPricesToLineItems.js';

import {
  prefixFieldsWithRefactoredDeep,
  prefixKeyWithRefactored,
  replaceLegacyWithRefactoredFieldsDeep,
} from '../../utils/priceRefactoring.js';

const pickIds = pick(['billableLineItemId', 'materialId'].map(prefixKeyWithRefactored));

const addLineItems = async (ctx, { order, lineItems: lineItemsInput, save = false }, trx) => {
  ctx.logger.debug(`addLineItems->save: ${save}`);
  ctx.logger.debug(`addLineItems->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(`addLineItems->lineItemsInput: ${JSON.stringify(lineItemsInput, null, 2)}`);

  try {
    const {
      businessUnit: { id: businessUnitId },
      businessLine: { id: businessLineId },
      priceGroupId,
      serviceDate,
    } = order;

    let lineItems = await applyPricesToLineItems(
      ctx,
      {
        date: serviceDate,
        businessUnitId,
        businessLineId,
        priceGroupId,
        lineItems: lineItemsInput.map(lineItem => ({
          ...lineItem,
          needRecalculatePrice: true,
        })),
      },
      { pricesRepo: PriceRepo },
      trx,
    );
    ctx.logger.debug(`addLineItems->lineItems: ${JSON.stringify(lineItems, null, 2)}`);

    if (save && lineItems.length) {
      const lineItemRepo = LineItemRepo.getInstance(ctx.state);
      const lineItemsToInsert = await Promise.all(
        lineItems.map(async item => {
          const mappedItem = await lineItemRepo.getLinkedHistoricalIds(
            pickIds(item),
            {
              update: false,
              entityId: item.id,
              entityRepo: lineItemRepo,
            },
            trx,
          );
          return {
            ...omit(['materialBasedPricing', 'total'])(item),
            ...mappedItem,
          };
        }),
      );
      if (lineItemsToInsert.length) {
        const addedLineItems = replaceLegacyWithRefactoredFieldsDeep(
          await lineItemRepo.upsertItems(
            {
              data: prefixFieldsWithRefactoredDeep(lineItemsToInsert),
              condition: { orderId: order.id },
              fields: ['id'],
            },
            trx,
          ),
        );
        lineItems = await lineItemRepo.populateLineItemsBy(
          {},
          [{ key: 'id', values: addedLineItems.map(({ id }) => id) }],
          trx,
        );
      }
    }

    return lineItems;
  } catch (error) {
    ctx.logger.error(error, `Error while adding line items for an order with id ${order.id}`);
    throw error;
  }
};

export default addLineItems;
