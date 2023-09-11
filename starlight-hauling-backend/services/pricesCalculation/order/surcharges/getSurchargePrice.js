const getSurchargePrice = async (
  ctx,
  { businessUnitId, businessLineId, priceGroupId, materialId, date, entityType },
  { pricesRepo },
) => {
  let query;
  const condition = { date, entityType };
  if (materialId) {
    condition.materialId = materialId;
  }
  if (priceGroupId) {
    condition.priceGroupId = priceGroupId;
    query = pricesRepo.getInstance(ctx.state).getForGroupByDate({
      condition,
    });
  } else {
    query = pricesRepo.getInstance(ctx.state).getGeneralByDate({
      condition,
      priceGroupCondition: {
        businessUnitId,
        businessLineId,
      },
    });
  }
  const price = await query;

  return price ?? null;
};

export default getSurchargePrice;
