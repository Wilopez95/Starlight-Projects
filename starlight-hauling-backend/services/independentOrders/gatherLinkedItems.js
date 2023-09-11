import LineItemRepo from '../../repos/v2/lineItem.js';
import ThresholdItemRepo from '../../repos/v2/thresholdItem.js';

const gatherLinkedItems = async (
  ctx,
  { orderId, lineItems: lineItemsInput = [], thresholds: thresholdsInput = [] },
  trx,
) => {
  ctx.logger.debug(`gatherLinkedItems->orderId: ${orderId}`);
  ctx.logger.debug(`gatherLinkedItems->lineItemsInput: ${JSON.stringify(lineItemsInput, null, 2)}`);
  ctx.logger.debug(
    `gatherLinkedItems->thresholdsInput: ${JSON.stringify(thresholdsInput, null, 2)}`,
  );

  const lineItemRepo = LineItemRepo.getInstance(ctx.state);
  const thresholdItemRepo = ThresholdItemRepo.getInstance(ctx.state);

  try {
    const { existingLineItemsMap, existingLineItemsIds, nonExistingLineItems } =
      lineItemsInput.reduce(
        (res, item) => {
          if (item.id) {
            res.existingLineItemsIds.push(item.id);
            res.existingLineItemsMap[item.id] = item;
          } else {
            res.nonExistingLineItems.push(item);
          }
          return res;
        },
        { existingLineItemsMap: {}, existingLineItemsIds: [], nonExistingLineItems: [] },
      );
    const { existingThresholdsMap, existingThresholdsIds, nonExistingThresholds } =
      thresholdsInput.reduce(
        (res, item) => {
          if (item.id) {
            res.existingThresholdsIds.push(item.id);
            res.existingThresholdsMap[item.id] = item;
          } else {
            res.nonExistingThresholds.push(item);
          }
          return res;
        },
        { existingThresholdsMap: {}, existingThresholdsIds: [], nonExistingThresholds: [] },
      );

    const [existingLineItemsPopulated, existingThresholdsPopulated] = await Promise.all([
      lineItemRepo.populateLineItemsBy({}, [{ key: 'id', values: existingLineItemsIds }], trx),
      thresholdItemRepo.populateThresholdItemsBy(
        {},
        [{ key: 'id', values: existingThresholdsIds }],
        trx,
      ),
    ]);

    const existingLineItems = existingLineItemsPopulated
      .map(item => {
        const {
          material: { originalId: materialId = null } = {},
          billableLineItem: { originalId: billableLineItemId },
        } = item;
        if (!existingLineItemsMap[item.id]) {
          // results in deleting
          return null;
        }
        return {
          ...existingLineItemsMap[item.id],
          materialId,
          billableLineItemId,
        };
      })
      .filter(Boolean);

    const existingThresholds = existingThresholdsPopulated
      .map(item => {
        const {
          material: { originalId: materialId = null } = {},
          threshold: { originalId: thresholdId },
        } = item;
        if (!existingThresholdsMap[item.id]) {
          // results in deleting
          return null;
        }
        return {
          ...existingThresholdsMap[item.id],
          materialId,
          thresholdId,
        };
      })
      .filter(Boolean);

    const linkedItems = {
      lineItems: [...existingLineItems, ...nonExistingLineItems],
      existingLineItems,
      nonExistingLineItems,
      thresholds: [...existingThresholds, ...nonExistingThresholds],
      existingThresholds,
      nonExistingThresholds,
    };
    ctx.logger.debug(`gatherLinkedItems->linkedItems: ${JSON.stringify(linkedItems, null, 2)}`);
    return linkedItems;
  } catch (error) {
    ctx.logger.error(error, `Error while gathering linked items for an order with id ${orderId}`);
    throw error;
  }
};

export default gatherLinkedItems;
