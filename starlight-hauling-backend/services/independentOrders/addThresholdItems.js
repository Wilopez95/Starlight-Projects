import pick from 'lodash/fp/pick.js';

import omit from 'lodash/fp/omit';
import PriceRepo from '../../repos/prices.js';
import ThresholdItemRepo from '../../repos/v2/thresholdItem.js';

import applyPricesToThresholdItems from '../pricesCalculation/order/prices/applyPricesToThresholdItems.js';

import {
  prefixFieldsWithRefactoredDeep,
  prefixKeyWithRefactored,
  replaceLegacyWithRefactoredFieldsDeep,
} from '../../utils/priceRefactoring.js';

const pickIds = pick(['billableThresholdItemId', 'materialId'].map(prefixKeyWithRefactored));

export const addThresholdItems = async (
  ctx,
  { order, thresholdItems: thresholdItemsInput, save = false },
  trx,
) => {
  ctx.logger.debug(`addThresholdItems->save: ${save}`);
  ctx.logger.debug(`addThresholdItems->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(
    `addThresholdItems->thresholdItemsInput: ${JSON.stringify(thresholdItemsInput, null, 2)}`,
  );

  try {
    const {
      businessUnit: { id: businessUnitId },
      businessLine: { id: businessLineId },
      priceGroupId,
      serviceDate,
    } = order;

    let thresholdItems = await applyPricesToThresholdItems(
      ctx,
      {
        date: serviceDate,
        businessUnitId,
        businessLineId,
        priceGroupId,
        thresholdItems: thresholdItemsInput.map(thresholdItem => ({
          ...thresholdItem,
          needRecalculatePrice: true,
        })),
      },
      { pricesRepo: PriceRepo },
      trx,
    );
    ctx.logger.debug(
      `addThresholdItems->thresholdItems: ${JSON.stringify(thresholdItems, null, 2)}`,
    );

    if (save && thresholdItems.length) {
      const thresholdItemRepo = ThresholdItemRepo.getInstance(ctx.state);
      const thresholdItemsToInsert = await Promise.all(
        thresholdItems.map(async ({ materialBasedPricing, ...item }) => {
          const mappedItem = await thresholdItemRepo.getLinkedHistoricalIds(
            pickIds(item),
            {
              update: false,
              entityId: item.id,
              entityRepo: thresholdItemRepo,
            },
            trx,
          );
          return {
            ...omit(['materialBasedPricing', 'total'])(item),
            ...mappedItem,
          };
        }),
      );
      if (thresholdItemsToInsert.length) {
        const addedThresholdItems = replaceLegacyWithRefactoredFieldsDeep(
          await thresholdItemRepo.upsertItems(
            {
              data: prefixFieldsWithRefactoredDeep(thresholdItemsToInsert),
              condition: { orderId: order.id },
              fields: ['id'],
            },
            trx,
          ),
        );
        thresholdItems = await thresholdItemRepo.populateThresholdItemsBy(
          {},
          [{ key: 'id', values: addedThresholdItems.map(({ id }) => id) }],
          trx,
        );
      }
    }
    // TODO: return line items to add/remove/update (caused by thresholds)

    return thresholdItems;
  } catch (error) {
    ctx.logger.error(error, `Error while adding threshold items for an order with id ${order.id}`);
    throw error;
  }
};

export default addThresholdItems;
