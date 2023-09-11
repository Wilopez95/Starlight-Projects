const getPriceGroupPrices = async (ctx, params, { pricesRepo }, trx) => {
  ctx.logger.debug(`getPriceGroupPrices->params: ${JSON.stringify(params, null, 2)}`);
  const { businessUnitId, businessLineId, priceGroupId, date, entityType } = params;
  const [general, custom] = await Promise.all([
    pricesRepo.getInstance(ctx.state).getAllGeneral(
      {
        condition: { entityType, date },
        priceGroupCondition: {
          businessUnitId,
          businessLineId,
        },
      },
      trx,
    ),
    priceGroupId
      ? pricesRepo.getInstance(ctx.state).getAllCustom(
          {
            condition: { priceGroupId, date, entityType },
            priceGroupCondition: {
              businessUnitId,
              businessLineId,
            },
          },
          trx,
        )
      : [],
  ]);

  const prices = {
    general,
    custom,
  };

  // ctx.logger.debug(`getPriceGroupPrices->prices: ${JSON.stringify(prices, null, 2)}`);

  return prices;
};

export default getPriceGroupPrices;
