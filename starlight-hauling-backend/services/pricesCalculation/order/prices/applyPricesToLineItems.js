import getPriceGroupPrices from '../common/getPriceGroupPrices.js';
import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';

import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';

const applyPricesToLineItems = async (ctx, { lineItems = [], ...params }, { pricesRepo }, trx) => {
  ctx.logger.debug(`applyPricesToLineItems->params: ${JSON.stringify(params, null, 2)}`);
  const { date, businessUnitId, businessLineId, priceGroupId } = params;
  const oneTimeLineItemPrices = await getPriceGroupPrices(
    ctx,
    {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem,
      date,
      businessUnitId,
      businessLineId,
      priceGroupId,
    },
    { pricesRepo },
    trx,
  );
  ctx.logger.debug(
    `applyPricesToLineItems->oneTimeLineItemPrices: ${JSON.stringify(
      oneTimeLineItemPrices,
      null,
      2,
    )}`,
  );

  return lineItems.map(({ needRecalculatePrice, ...lineItem }) => {
    ctx.logger.debug(`applyPricesToLineItems->needRecalculatePrice: ${needRecalculatePrice}`);
    ctx.logger.debug(`applyPricesToLineItems->lineItem: ${JSON.stringify(lineItem, null, 2)}`);
    const {
      lineItemId,
      billableLineItemId,
      materialId,
      price,
      priceId,
      quantity,
      materialBasedPricing,
    } = lineItem;
    let calculatedPrice = price;
    let calculatedPriceId = priceId;

    if (!Number.isSafeInteger(price) || (lineItemId && needRecalculatePrice)) {
      const conditions = {
        entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem,
        materialId: materialBasedPricing ? materialId : null,
        billableLineItemId,
      };
      ctx.logger.debug(
        `applyPricesToLineItems->conditions: ${JSON.stringify(conditions, null, 2)}`,
      );

      const lineItemPrice = getPriceForBillableItem(conditions, oneTimeLineItemPrices) ?? {};
      ctx.logger.debug(
        `applyPricesToLineItems->lineItemPrice: ${JSON.stringify(lineItemPrice, null, 2)}`,
      );

      ({ price: calculatedPrice = null, id: calculatedPriceId = null } = lineItemPrice);
    }

    return {
      ...lineItem,
      priceId: calculatedPriceId,
      price: calculatedPrice,
      total: !Number.isSafeInteger(calculatedPrice) ? null : Math.trunc(calculatedPrice * quantity),
      quantity,
    };
  });
};

export default applyPricesToLineItems;
