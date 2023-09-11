import pick from 'lodash/fp/pick.js';

import isEmpty from 'lodash/isEmpty.js';
import PriceRepo from '../../../../repos/prices.js';
import SurchargeItemRepo from '../../../../repos/v2/orderSurcharge.js';

import applyPricesToSurchargeItems from '../prices/applyPricesToSurchargeItems.js';
import {
  prefixFieldsWithRefactoredDeep,
  replaceLegacyWithRefactoredFieldsDeep,
} from '../../../../utils/priceRefactoring.js';
import gatherApplicableSurcharges from './gatherApplicableSurcharges.js';

const SURCHARGE_FIELDS_FOR_ITEM = [
  'billableServiceId',
  'quantity',
  'amount',
  'priceId',
  'surchargeId',
];

// run this after saving linked billable items (line_items, threshold_items) and getting their ids
// and after gatherLinkedItems
const applySurcharges = async (
  ctx,
  {
    order,
    lineItems = [], // for existing - mapped to original references, non-existing are expected to come with originalIds
    thresholdItems = [], // for existing - mapped to original references, non-existing are expected to come with originalIds
    recalculateExisting = false,
  },
  trx,
) => {
  ctx.logger.debug(`applySurcharges->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(`applySurcharges->lineItems: ${JSON.stringify(lineItems, null, 2)}`);
  ctx.logger.debug(
    `applySurcharges->thresholdItemsInput: ${JSON.stringify(thresholdItems, null, 2)}`,
  );

  try {
    const surchargeItemRepo = SurchargeItemRepo.getInstance(ctx.state);

    const applySurchargesToLineItems = lineItems.reduce(
      (res, lineItem) => res || lineItem.applySurcharges,
      false,
    );
    const applySurchargesToThresholds = thresholdItems.reduce(
      (res, threshold) => res || threshold.applySurcharges,
      false,
    );
    const applySurchargesToService = order.applySurcharges;
    const needsToApplySurcharges =
      applySurchargesToService || applySurchargesToLineItems || applySurchargesToThresholds;

    const existingSurchargeItems =
      (await surchargeItemRepo.populateSurchargesByOrderId(order.id, trx)) ?? [];
    ctx.logger.debug(
      `applySurcharges->existingSurchargeItems: ${JSON.stringify(existingSurchargeItems, null, 2)}`,
    );

    const existingSurchargeItemsMap = existingSurchargeItems.reduce(
      (res, existingSurchargeItem) => {
        const {
          billableService: { originalId: billableServiceId = null } = {},
          material: { originalId: materialId = null } = {},
          billableLineItem: { originalId: billableLineItemId = null } = {},
          threshold: { originalId: thresholdId = null } = {},
          lineItem: { id: lineItemId = null } = {},
          thresholdItem: { id: thresholdItemId = null } = {},
        } = existingSurchargeItem;
        const key = `${billableServiceId}_${materialId}_${billableLineItemId}_${thresholdId}_${lineItemId}_${thresholdItemId}`;
        // Example why lineItemId and thresholdItemId are required (agreed with BA):
        // when we've charged trip charge once on re-schedule and once again on cancel
        // there can be 2 different line_items or threshold_items entities linked with the same billableLineItem or threshold
        // for different dates and probably with different prices (because price depends on date)
        res[key] = existingSurchargeItem;
        return res;
      },
      {},
    );
    const {
      businessLine: { id: businessLineId },
      businessUnit: { id: businessUnitId },
      priceGroupId,
      serviceDate,
    } = order;

    let applicableSurchargeItems = [];
    if (!needsToApplySurcharges) {
      if (recalculateExisting) {
        // if we re-calculate then old items that are linked
        // with no more existing billable items or billable items that shouldn't apply surcharges must be removed
        const existingSurchargeItemsIdsToDelete = existingSurchargeItems.map(
          existingSurchargeItem => existingSurchargeItem.id,
        );
        existingSurchargeItemsIdsToDelete.length &&
          (await surchargeItemRepo.deleteByIds({ ids: existingSurchargeItemsIdsToDelete }, trx));
      }
      return [];
      // pre-pricing service code:
      // } else {
      //   applicableSurchargeItems = await gatherApplicableSurcharges(
      //     ctx,
      //     {
      //       order,
      //       lineItems,
      //       thresholdItems,
      //       applySurchargesToService,
      //       applySurchargesToLineItems,
      //       applySurchargesToThresholds,
      //     },
      //     trx,
      //   );
      //   ctx.logger.debug(
      //     `applySurcharges->applicableSurchargeItems: ${JSON.stringify(
      //       applicableSurchargeItems,
      //       null,
      //       2,
      //     )}`,
      //   );
    }
    applicableSurchargeItems = await gatherApplicableSurcharges(
      ctx,
      {
        order,
        lineItems,
        thresholdItems,
        applySurchargesToService,
        applySurchargesToLineItems,
        applySurchargesToThresholds,
      },
      trx,
    );
    ctx.logger.debug(
      `applySurcharges->applicableSurchargeItems: ${JSON.stringify(
        applicableSurchargeItems,
        null,
        2,
      )}`,
    );

    if (!applicableSurchargeItems.length) {
      return [];
    }

    const applicableSurchargeItemsWithPrice = await applyPricesToSurchargeItems(
      ctx,
      {
        surcharges: applicableSurchargeItems,
        date: serviceDate,
        businessUnitId,
        businessLineId,
        priceGroupId,
      },
      { pricesRepo: PriceRepo },
      trx,
    );
    ctx.logger.debug(
      `applySurcharges->applicableSurchargeItemsWithPrice: ${JSON.stringify(
        applicableSurchargeItemsWithPrice,
        null,
        2,
      )}`,
    );

    const applicableSurchargeItemsMap = applicableSurchargeItemsWithPrice.reduce(
      (res, applicableSurchargeItem) => {
        const {
          billableServiceId,
          materialId,
          billableLineItemId,
          thresholdId,
          lineItemId,
          thresholdItemId,
        } = applicableSurchargeItem;
        const key = `${billableServiceId}_${materialId}_${billableLineItemId}_${thresholdId}_${lineItemId}_${thresholdItemId}`;
        // Example why lineItemId and thresholdItemId are required (agreed with BA):
        // when we've charged trip charge once on re-schedule and once again on cancel
        // there can be 2 different line_items or threshold_items entities linked with the same billableLineItem or threshold
        // for different dates and probably with different prices (because price depends on date)
        res[key] = applicableSurchargeItem;
        return res;
      },
      {},
    );
    ctx.logger.debug(
      `applySurcharges->applicableSurchargeItemsMap: ${JSON.stringify(
        applicableSurchargeItemsMap,
        null,
        2,
      )}`,
    );

    const existingSurchargeItemsMapKeys = Object.keys(existingSurchargeItemsMap) ?? [];
    const applicableSurchargeItemsMapKeys = Object.keys(applicableSurchargeItemsMap) ?? [];

    let existingSurchargeItemsIdsToDelete = [];
    const existingNotChangedSurchargeItems = [];
    const existingSurchargeItemsToUpdate = [];
    const applicableSurchargeItemsToAdd = [];
    if (recalculateExisting) {
      // if we re-calculate then old items that are linked with no more existing billable items must be removed
      existingSurchargeItemsIdsToDelete = existingSurchargeItemsMapKeys
        .filter(key => !applicableSurchargeItemsMapKeys.includes(key))
        .map(key => existingSurchargeItemsMap[key].id);

      // if we re-calculate - then new surcharge_item(s) that exists in old surcharge_item(s) must replace them
      // otherwise (not exists) - insert new surcharge_item(s)
      Object.entries(applicableSurchargeItemsMap).forEach(([key, applicableSurchargeItem]) => {
        if (existingSurchargeItemsMap[key]) {
          existingSurchargeItemsToUpdate.push({
            ...pick(SURCHARGE_FIELDS_FOR_ITEM)(applicableSurchargeItem),
            id: existingSurchargeItemsMap[key].id,
            orderId: order.id,
          });
        } else {
          applicableSurchargeItemsToAdd.push({
            ...pick(SURCHARGE_FIELDS_FOR_ITEM)(applicableSurchargeItem),
            orderId: order.id,
          });
        }
      });
    } else {
      // if we don't re-calculate - then we're only inserting new surcharge_item(s)
      // that not exists in old surcharge_item(s)
      Object.entries(applicableSurchargeItemsMap).forEach(([key, applicableSurchargeItem]) => {
        if (existingSurchargeItemsMap[key]) {
          existingNotChangedSurchargeItems.push(existingSurchargeItemsMap[key]);
        } else {
          applicableSurchargeItemsToAdd.push({
            ...pick(SURCHARGE_FIELDS_FOR_ITEM)(applicableSurchargeItem),
            orderId: order.id,
          });
        }
      });
    }
    ctx.logger.debug(
      `applySurcharges->existingNotChangedSurchargeItems: ${JSON.stringify(
        existingNotChangedSurchargeItems,
        null,
        2,
      )}`,
    );
    ctx.logger.debug(
      `applySurcharges->existingSurchargeItemsIdsToDelete: ${JSON.stringify(
        existingSurchargeItemsIdsToDelete,
        null,
        2,
      )}`,
    );
    ctx.logger.debug(
      `applySurcharges->existingSurchargeItemsToUpdate: ${JSON.stringify(
        existingSurchargeItemsToUpdate,
        null,
        2,
      )}`,
    );
    ctx.logger.debug(
      `applySurcharges->applicableSurchargeItemsToAdd: ${JSON.stringify(
        applicableSurchargeItemsToAdd,
        null,
        2,
      )}`,
    );

    const [, updated = [], added = []] = await Promise.all([
      existingSurchargeItemsIdsToDelete.length
        ? surchargeItemRepo.deleteByIds({ ids: existingSurchargeItemsIdsToDelete }, trx)
        : null,
      existingSurchargeItemsToUpdate.length
        ? surchargeItemRepo.upsertMany(
            {
              data: prefixFieldsWithRefactoredDeep(existingSurchargeItemsToUpdate),
              condition: { orderId: order.id },
              fields: ['*'],
              // TODO: `log: true,` ?
            },
            trx,
          )
        : [],
      applicableSurchargeItemsToAdd.length
        ? surchargeItemRepo.insertMany(
            {
              data: prefixFieldsWithRefactoredDeep(applicableSurchargeItemsToAdd),
              fields: ['*'],
            },
            trx,
          )
        : [],
    ]);

    const allSurchargeItems = [
      ...existingNotChangedSurchargeItems,
      ...(!isEmpty(updated) ? replaceLegacyWithRefactoredFieldsDeep(updated) : []),
      ...(!isEmpty(added) ? replaceLegacyWithRefactoredFieldsDeep(added) : []),
    ];
    ctx.logger.debug(
      `applySurcharges->allSurchargeItems: ${JSON.stringify(allSurchargeItems, null, 2)}`,
    );

    return allSurchargeItems;
  } catch (error) {
    ctx.logger.error(error, `Error while applying surcharges for an order with id ${order.id}`);
    throw error;
  }
};

export default applySurcharges;
