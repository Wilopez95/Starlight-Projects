import SurchargeRepo from '../../../../repos/billableSurcharge.js';

const gatherApplicableSurcharges = async (
  ctx,
  {
    order,
    lineItems = [],
    thresholdItems = [],
    applySurchargesToService,
    applySurchargesToLineItems,
    applySurchargesToThresholds,
  },
  trx,
) => {
  ctx.logger.debug(`gatherApplicableSurcharges->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(`gatherApplicableSurcharges->lineItems: ${JSON.stringify(lineItems, null, 2)}`);
  ctx.logger.debug(
    `gatherApplicableSurcharges->thresholdItems: ${JSON.stringify(thresholdItems, null, 2)}`,
  );

  try {
    const {
      businessLine: { id: businessLineId },
    } = order;

    const surchargeRepo = SurchargeRepo.getInstance(ctx.state);
    const surcharges =
      (await surchargeRepo.getAll(
        {
          condition: { active: true, businessLineId },
        },
        trx,
      )) ?? [];
    ctx.logger.debug(
      `gatherApplicableSurcharges->surcharges: ${JSON.stringify(surcharges, null, 2)}`,
    );
    const nonMaterialBasedSurcharges = surcharges.filter(
      ({ materialBasedPricing }) => !materialBasedPricing,
    );
    const materialBasedSurcharges = surcharges.filter(
      ({ materialBasedPricing }) => !!materialBasedPricing,
    );

    const lineItemsSurcharges = [];
    if (applySurchargesToLineItems) {
      lineItems
        .filter(({ applySurcharges }) => applySurcharges)
        .forEach(({ id: lineItemId = null, billableLineItemId, materialId, price, quantity }) => {
          if (materialId && materialBasedSurcharges?.length) {
            lineItemsSurcharges.push(
              ...materialBasedSurcharges.map(surcharge => ({
                ...surcharge,
                lineItemId,
                billableLineItemId,
                billableItemTotal: quantity * price,
                quantity,
                materialId,
              })),
            );
          }
          if (nonMaterialBasedSurcharges?.length) {
            lineItemsSurcharges.push(
              ...nonMaterialBasedSurcharges.map(surcharge => ({
                ...surcharge,
                lineItemId,
                billableLineItemId,
                billableItemTotal: quantity * price,
                quantity,
              })),
            );
          }
        });
    }
    ctx.logger.debug(
      `gatherApplicableSurcharges->lineItemsSurcharges: ${JSON.stringify(
        lineItemsSurcharges,
        null,
        2,
      )}`,
    );

    const thresholdItemsSurcharges = [];
    if (applySurchargesToThresholds) {
      thresholdItems
        .filter(({ applySurcharges }) => applySurcharges)
        .forEach(({ id: thresholdItemId = null, thresholdId, materialId, price, quantity }) => {
          // threshold inherits material from the order
          if (materialId && materialBasedSurcharges?.length) {
            thresholdItemsSurcharges.push(
              ...materialBasedSurcharges.map(surcharge => ({
                ...surcharge,
                thresholdItemId,
                thresholdId,
                billableItemTotal: quantity * price,
                quantity,
                materialId,
              })),
            );
          }
          if (nonMaterialBasedSurcharges?.length) {
            thresholdItemsSurcharges.push(
              ...nonMaterialBasedSurcharges.map(surcharge => ({
                ...surcharge,
                thresholdItemId,
                thresholdId,
                billableItemTotal: quantity * price,
                quantity,
              })),
            );
          }
        });
    }
    ctx.logger.debug(
      `gatherApplicableSurcharges->thresholdItemsSurcharges: ${JSON.stringify(
        thresholdItemsSurcharges,
        null,
        2,
      )}`,
    );

    const serviceSurcharges = [];
    if (applySurchargesToService) {
      const {
        material: { originalId: materialId },
      } = order;
      if (materialId && materialBasedSurcharges?.length) {
        serviceSurcharges.push(
          ...materialBasedSurcharges.map(surcharge => ({
            ...surcharge,
            billableServiceId: order.billableServiceId,
            billableItemTotal: order.price,
            quantity: 1,
            materialId,
          })),
        );
      }
      if (nonMaterialBasedSurcharges?.length) {
        serviceSurcharges.push(
          ...nonMaterialBasedSurcharges.map(surcharge => ({
            ...surcharge,
            billableServiceId: order.billableServiceId,
            billableItemTotal: order.price,
            quantity: 1,
          })),
        );
      }
    }
    ctx.logger.debug(
      `gatherApplicableSurcharges->serviceSurcharges: ${JSON.stringify(
        serviceSurcharges,
        null,
        2,
      )}`,
    );

    const resultingSurchargeItems = [
      ...lineItemsSurcharges,
      ...thresholdItemsSurcharges,
      ...serviceSurcharges,
    ];
    ctx.logger.debug(
      `gatherApplicableSurcharges->resultingSurchargeItems: ${JSON.stringify(
        resultingSurchargeItems,
        null,
        2,
      )}`,
    );
    return resultingSurchargeItems;
  } catch (error) {
    ctx.logger.error(
      error,
      `Error while gathering applicable surcharges for an order with id ${order.id}`,
    );
    throw error;
  }
};

export default gatherApplicableSurcharges;
