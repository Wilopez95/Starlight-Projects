import getPriceGroupPrices from '../common/getPriceGroupPrices.js';
import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';

import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';

const applyPriceToService = async (ctx, { order, ...params }, { pricesRepo }, trx) => {
  ctx.logger.debug(`applyPriceToService->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(`applyPriceToService->params: ${JSON.stringify(params, null, 2)}`);
  const { needRecalculatePrice, date, businessUnitId, businessLineId, priceGroupId } = params;
  const servicePrices = await getPriceGroupPrices(
    ctx,
    {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
      date,
      businessUnitId,
      businessLineId,
      priceGroupId,
    },
    { pricesRepo },
    trx,
  );
  ctx.logger.debug(`applyPriceToService->servicePrices: ${JSON.stringify(servicePrices, null, 2)}`);

  const {
    orderId,
    billableServiceId,
    materialId,
    equipmentItemId,
    price,
    priceId,
    quantity,
    materialBasedPricing,
  } = order;
  let calculatedPrice = price;
  let calculatedPriceId = priceId;

  if (!Number.isSafeInteger(price) || (orderId && needRecalculatePrice)) {
    const conditions = {
      entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.service,
      materialId: materialBasedPricing ? materialId : null,
      billableServiceId,
      equipmentItemId,
    };
    ctx.logger.debug(`applyPriceToService->conditions: ${JSON.stringify(conditions, null, 2)}`);

    const servicePrice = getPriceForBillableItem(conditions, servicePrices) ?? {};
    ctx.logger.debug(`applyPriceToService->servicePrice: ${JSON.stringify(servicePrice, null, 2)}`);

    ({ price: calculatedPrice = null, id: calculatedPriceId = null } = servicePrice);
  }

  return {
    ...order,
    priceId: calculatedPriceId,
    price: calculatedPrice,
    servicesTotal: !Number.isSafeInteger(calculatedPrice)
      ? null
      : Math.trunc(calculatedPrice * quantity),
    quantity,
  };
};

export default applyPriceToService;
