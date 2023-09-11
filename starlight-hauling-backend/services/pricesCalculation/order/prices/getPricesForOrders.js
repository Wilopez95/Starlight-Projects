import isNull from 'lodash/isNull.js';

import getPriceForBillableItem from '../common/getPriceForBillableItem/getPriceForBillableItem.js';
import getPriceGroupPrices from '../common/getPriceGroupPrices.js';
import { PRICE_ENTITY_TYPE_CAMEL_CASE } from '../../../../consts/priceEntityTypes.js';
import getPricesForLineItems from './getPricesForLineItems.js';
import getPricesForThresholds from './getPricesForThresholds.js';
import getPricesForExistingOrder from './getPricesForExistingOrder.js';

const getPricesForOrders = (
  ctx,
  { businessUnitId, businessLineId, orders },
  { baseRepo, priceGroupsRepo, pricesRepo, orderRepo },
  trx,
) => {
  const priceGroupsRepoInstance = priceGroupsRepo.getInstance(ctx.state);
  return Promise.all(
    orders.map(async order => {
      const { orderId, serviceDate } = order;
      let { priceGroupId } = order;
      let existingOrderPrices;

      if (orderId) {
        if (priceGroupId) {
          order.priceGroupHistoricalId = priceGroupId;
          const priceGroupHistorical = await priceGroupsRepoInstance.getHistoricalRecordById(
            {
              id: priceGroupId,
              fields: ['id'],
            },
            trx,
          );
          // eslint-disable-next-line no-multi-assign
          order.priceGroupId = priceGroupId = priceGroupHistorical?.id ?? null;
        }

        existingOrderPrices = await getPricesForExistingOrder(ctx, { orderId }, { orderRepo }, trx);
      } else if (priceGroupId) {
        const priceGroupHistorical = await baseRepo.getNewestHistoricalRecord(
          {
            tableName: priceGroupsRepoInstance.tableName,
            schemaName: priceGroupsRepoInstance.schemaName,
            condition: { originalId: priceGroupId },
          },
          trx,
        );
        order.priceGroupHistoricalId = priceGroupHistorical?.id ?? null;
      }

      const {
        billableServiceId,
        equipmentItemId,
        materialId,
        price,
        priceId,
        quantity,
        needRecalculatePrice,
        lineItems,
        thresholds,
        surcharges,
        applySurcharges,
        materialBasedPricing,
        taxDistricts,
        workOrder,
        commercialTaxesUsed,
      } = orderId ? existingOrderPrices : order;
      let calculatedPrice = price;
      let calculatedPriceId = priceId;

      const lineItemsWithPrices = await getPricesForLineItems(
        ctx,
        {
          date: serviceDate,
          businessUnitId,
          businessLineId,
          priceGroupId,
          lineItems,
        },
        { pricesRepo },
        trx,
      );

      const thresholdsWithPrices = await getPricesForThresholds(
        ctx,
        {
          date: serviceDate,
          businessUnitId,
          businessLineId,
          priceGroupId,
          thresholds,
        },
        { pricesRepo },
        trx,
      );

      if (isNull(price) || (orderId && needRecalculatePrice)) {
        const oneTimeServicePrices = await getPriceGroupPrices(
          ctx,
          {
            entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
            date: serviceDate,
            businessUnitId,
            businessLineId,
            priceGroupId,
          },
          { pricesRepo },
          trx,
        );

        const conditions = {
          entityType: PRICE_ENTITY_TYPE_CAMEL_CASE.oneTimeService,
          materialId: materialBasedPricing ? materialId : null,
          billableServiceId,
          equipmentItemId,
        };

        ({ price: calculatedPrice = null, id: calculatedPriceId = null } =
          getPriceForBillableItem(conditions, oneTimeServicePrices) ?? {});
      }

      return {
        lineItems: lineItemsWithPrices,
        thresholds: thresholdsWithPrices,
        priceId: calculatedPriceId,
        price: calculatedPrice,
        total: isNull(calculatedPrice) ? null : Math.trunc(calculatedPrice * quantity),
        quantity,
        surcharges,
        applySurcharges,
        taxDistricts,
        workOrder,
        commercialTaxesUsed,
      };
    }),
  );
};

export default getPricesForOrders;
