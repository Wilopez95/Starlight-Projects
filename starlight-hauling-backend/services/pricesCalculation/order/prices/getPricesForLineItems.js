import getPriceGroupPrices from '../common/getPriceGroupPrices.js';
import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';

import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';

const getPricesForLineItems = (
  ctx,
  { lineItems = [], date, businessUnitId, businessLineId, priceGroupId },
  { pricesRepo },
  trx,
) =>
  Promise.all(
    lineItems.map(async lineItem => {
      ctx.logger.debug(`getPricesForLineItems->lineItem: ${JSON.stringify(lineItem, null, 2)}`);
      const {
        lineItemId,
        billableLineItemId,
        materialId,
        price,
        priceId,
        quantity,
        needRecalculatePrice,
        materialBasedPricing,
      } = lineItem;
      let calculatedPrice = price;
      let calculatedPriceId = priceId;

      if (!Number.isSafeInteger(price) || (lineItemId && needRecalculatePrice)) {
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
          `getPricesForLineItems->oneTimeLineItemPrices: ${JSON.stringify(
            oneTimeLineItemPrices,
            null,
            2,
          )}`,
        );

        const conditions = {
          entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeLineItem,
          materialId: materialBasedPricing ? materialId : null,
          billableLineItemId,
        };
        ctx.logger.debug(
          `getPricesForLineItems->conditions: ${JSON.stringify(conditions, null, 2)}`,
        );

        const lineItemPrice = getPriceForBillableItem(conditions, oneTimeLineItemPrices) ?? {};
        ctx.logger.debug(
          `getPricesForLineItems->lineItemPrice: ${JSON.stringify(lineItemPrice, null, 2)}`,
        );

        ({ price: calculatedPrice = null, id: calculatedPriceId = null } = lineItemPrice);
      }

      return {
        priceId: calculatedPriceId,
        price: calculatedPrice,
        total: !Number.isSafeInteger(calculatedPrice)
          ? null
          : Math.trunc(calculatedPrice * quantity),
        quantity,
      };
    }),
  );

export default getPricesForLineItems;
