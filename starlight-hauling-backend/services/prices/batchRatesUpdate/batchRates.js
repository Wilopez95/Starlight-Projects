import knex from '../../../db/connection.js';

import PricesRepository from '../../../repos/prices.js';

import getServicesFilters from './getServicesFilters/getServicesFilters.js';
import getPricesFilters from './getPricesFilters/getPricesFilters.js';
import getPrices from './getPrices/getPrices.js';
import calculatePrices from './calculatePrices/calculatePrices.js';
import mapPreview from './mapPreview/mapPreview.js';

const batchRates = async (
  ctxState,
  {
    lineItems,
    equipmentItems,
    target,
    services,
    materials,
    businessLineId,
    businessUnitId,
    application,
    applyTo,
    overridePrices,
    effectiveDate,
    calculation,
    value,
    source,
    today,
  },
  { isPreview = false } = {},
  repos = {},
) => {
  const trx = await knex.transaction();

  try {
    const { servicesFilters, includeNonMaterial, entityType } = getServicesFilters({
      lineItems,
      equipmentItems,
      target,
      services,
      materials,
    });

    const { priceGroupsIds, lineItemIds, servicesIds, equipmentItemIds, materialIds } =
      await getPricesFilters(
        ctxState,
        {
          servicesFilters,
          businessLineId,
          businessUnitId,
          application,
          applyTo,
        },
        trx,
        repos,
      );

    const { oldPrices, nextOverriddenPrices, generalPrices } = await getPrices(
      ctxState,
      {
        isPreview,
        entityType,
        includeNonMaterial,
        overridePrices,
        today,
        priceGroupsIds,
        lineItemIds,
        servicesIds,
        equipmentItemIds,
        materialIds,
        businessLineId,
        businessUnitId,
      },
      trx,
      repos,
    );

    const { currentPrices = [], nextPrices = [] } = calculatePrices(
      {
        priceGroupsIds,
        oldPrices,
        generalPrices,
        effectiveDate,
        calculation,
        value,
        source,
      },
      repos,
    );

    if (isPreview) {
      const previewPrices = await mapPreview(ctxState, nextPrices, repos);
      return { previewPrices };
    }

    const pricesRepo = (repos?.PricesRepo ?? PricesRepository).getInstance(ctxState);
    const fields = ['id'];

    const [updatedPrices, insertedPrices, deletedPrices] = await Promise.all([
      currentPrices.length
        ? pricesRepo.updateMany({ data: currentPrices, fields }, trx)
        : Promise.resolve(),

      nextPrices.length
        ? pricesRepo.insertMany(
            { data: nextPrices.map(({ basePrice, ...item }) => item), fields },
            trx,
          )
        : Promise.resolve(),
      nextOverriddenPrices.length
        ? pricesRepo.deleteByIds({ ids: nextOverriddenPrices.map(item => item.id), fields }, trx)
        : Promise.resolve(),
    ]);

    await trx.commit();

    return { updatedPrices, insertedPrices, deletedPrices };
  } catch (error) {
    await trx.rollback();

    throw error;
  }
};

export default batchRates;
