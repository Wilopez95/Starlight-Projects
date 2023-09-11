import omit from 'lodash/fp/omit.js';
import pick from 'lodash/fp/pick.js';

import LineItemRepo from '../../repos/v2/lineItem.js';

import { replaceLegacyWithRefactoredFieldsDeep } from '../../utils/priceRefactoring.js';
import addLineItems from './addLineItems.js';

const pickIds = pick(['billableLineItemId', 'materialId']);

const updateLineItems = async (ctx, { oldOrder, inputLineItems = [] }, trx) => {
  ctx.logger.debug(`updateLineItems->oldOrder: ${JSON.stringify(oldOrder, null, 2)}`);
  ctx.logger.debug(`updateLineItems->inputLineItems: ${JSON.stringify(inputLineItems, null, 2)}`);

  const lineItemRepo = LineItemRepo.getInstance(ctx.state);

  try {
    const { lineItemsToEditMap, lineItemsToEdit, lineItemsToAdd } = inputLineItems.reduce(
      (res, item) => {
        if (item.id) {
          res.lineItemsToEdit.push(item);
          res.lineItemsToEditMap[item.id] = item;
        } else {
          res.lineItemsToAdd.push(item);
        }
        return res;
      },
      { lineItemsToEditMap: {}, lineItemsToEdit: [], lineItemsToAdd: [] },
    );
    const { lineItemsToDeleteIds } = (oldOrder.lineItems || []).reduce(
      (res, item) => {
        if (!lineItemsToEditMap[item.id]) {
          res.lineItemsToDeleteIds.push(item.id);
        } else {
          if (lineItemsToEditMap[item.id].billableLineItemId !== item.billableLineItemId) {
            // there is a chance to get equal values for different line items:
            // because we can get original ID of the trip charge line item and compare with historical ID of the deposit line item
            // they can be equal because we're getting them from different tables
            // (historical for a value from DB and original for a change value from FE)
            // solution to use always latest historical IDs (like it works now)
            // means that we always re-create items to the latest versions (if differs)
            // TODO: discuss possible solutions (all I can imaging affects FE)
            lineItemsToEditMap[item.id].lineItemChanged = true;
          }
          if (lineItemsToEditMap[item.id].materialId !== item.materialId) {
            // there is a chance to get equal values for different materials:
            // because we can get original ID of the wood materials and compare with historical ID of the metal material
            // they can be equal because we're getting them from different tables
            // (historical for a value from DB and original for a change value from FE)
            // solution to use always latest historical IDs (like it works now)
            // means that we always re-create items to the latest versions (if differs)
            // TODO: discuss possible solutions (all I can imaging affects FE)
            lineItemsToEditMap[item.id].materialChanged = true;
          }
        }
        return res;
      },
      { lineItemsToDeleteIds: [] },
    );

    // TODO: completely refactor this to really use bulk DB operations instead of lists of promises with single DB operations
    //  https://starlightpro.atlassian.net/browse/HAULING-6543
    const [lineItemsToInsert, lineItemsToUpdate] = await Promise.all([
      Promise.all(
        lineItemsToAdd.map(async item => {
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
      ),
      Promise.all(
        lineItemsToEdit.map(async item => {
          const idsToMap = [];
          item.lineItemChanged && idsToMap.push('billableLineItemId');
          item.materialChanged && idsToMap.push('materialId');
          const mappedItem = idsToMap.length
            ? await lineItemRepo.getLinkedHistoricalIds(
                pick(idsToMap)(item),
                {
                  update: false,
                  entityId: item.id,
                  entityRepo: lineItemRepo,
                },
                trx,
              )
            : {};
          return {
            ...omit(['lineItemChanged', 'materialChanged'])(item),
            ...mappedItem,
          };
        }),
      ),
    ]);
    await Promise.all([
      addLineItems(ctx, { order: oldOrder, lineItems: lineItemsToInsert, save: true }, trx),
      lineItemsToUpdate.length
        ? lineItemRepo.upsertItems(
            {
              data: lineItemsToUpdate,
              condition: { orderId: oldOrder.id },
              fields: [],
            },
            trx,
          )
        : null,
      lineItemRepo.deleteByIds({ ids: lineItemsToDeleteIds }, trx),
    ]);

    const lineItems =
      replaceLegacyWithRefactoredFieldsDeep(
        await lineItemRepo.populateLineItemsByOrderIds([oldOrder.id], trx),
      ) ?? [];

    ctx.logger.debug(`updateLineItems->lineItems: ${JSON.stringify(lineItems, null, 2)}`);

    return lineItems;
  } catch (error) {
    ctx.logger.error(error, `Error while updating line items for an order with id ${oldOrder.id}`);
    throw error;
  }
};

export default updateLineItems;
